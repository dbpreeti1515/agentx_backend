const { decideNextAction } = require("./decisionEngine");
const { extractRequirements } = require("../tools/extractRequirements");
const { identifyGaps } = require("../tools/identifyGaps");
const { generateQuestion } = require("../tools/generateQuestions");
const { generateProposal } = require("../tools/generateProposal");
const { reviseProposal } = require("../tools/reviseProposal");
const { calculateConfidence } = require("./confidenceEngine");
const sessionRepository = require("../repositories/sessionRepository");
const logger = require("../services/logger");

const MAX_ITERATIONS = Math.min(
  5,
  Math.max(3, Number(process.env.AGENT_MAX_ITERATIONS || 4))
);

async function persistSession(sessionId, session, fields) {
  const nextState = await sessionRepository.updateSessionFields(sessionId, {
    ...fields,
  });

  Object.assign(session, nextState);
  return session;
}

async function runAgentLoop(session) {
  const iterationLogs = [];
  const sessionId = session.sessionId;

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration += 1) {
    await persistSession(sessionId, session, {
      agentState: {
        ...session.agentState,
        iterations: iteration,
        status: "processing",
        currentStep: "extract_requirements",
      },
    });

    const requirementResult = await extractRequirements({
      messages: session.messages,
      currentRequirements: session.requirements,
    });

    await persistSession(sessionId, session, {
      requirements: requirementResult.requirements,
      agentState: {
        ...session.agentState,
        currentStep: "identify_gaps",
        lastError: requirementResult.parsingSucceeded
          ? null
          : "Requirement extraction returned invalid JSON. Fallback merge applied.",
      },
    });

    const gapResult = await identifyGaps({
      requirements: session.requirements,
      messages: session.messages,
    });

    const confidence = calculateConfidence(session.requirements, gapResult.gaps);

    await persistSession(sessionId, session, {
      gaps: gapResult.gaps,
      agentState: {
        ...session.agentState,
        readyForProposal: Boolean(gapResult.gaps.readyForProposal),
        currentStep: "decision",
        confidence,
        lastError: gapResult.parsingSucceeded
          ? session.agentState.lastError
          : "Gap analysis returned invalid JSON. Deterministic fallback applied.",
      },
    });

    const latestUserMessage = [...session.messages]
      .reverse()
      .find((message) => message.role === "user")?.content;

    const decisionResult = await decideNextAction({
      requirements: session.requirements,
      gaps: session.gaps,
      proposal: session.proposal,
      messages: session.messages,
      latestUserMessage,
      maxIterations: MAX_ITERATIONS,
      iteration,
    });

    await persistSession(sessionId, session, {
      agentState: {
        ...session.agentState,
        lastDecision: decisionResult.decision.action,
        lastThought: decisionResult.decision.thought,
        readyForProposal: decisionResult.decision.readyForProposal,
        confidence: decisionResult.decision.confidence,
      },
    });

    iterationLogs.push({
      iteration,
      thought: decisionResult.decision.thought,
      action: decisionResult.decision.action,
      reasoning: decisionResult.decision.reasoning,
      confidence: decisionResult.decision.confidence,
    });

    logger.info({
      event: "agent_step",
      sessionId,
      iteration,
      thought: decisionResult.decision.thought,
      action: decisionResult.decision.action,
      confidence: decisionResult.decision.confidence,
    });

    if (decisionResult.decision.action === "extract_requirements") {
      continue;
    }

    if (decisionResult.decision.action === "no_action") {
      await persistSession(sessionId, session, {
        agentState: {
          ...session.agentState,
          status: "completed",
          currentStep: "completed",
          stopReason: "no_action",
        },
      });

      return {
        status: "no_action",
        thought: decisionResult.decision.thought,
        action: "no_action",
        reasoning: decisionResult.decision.reasoning,
        confidence: decisionResult.decision.confidence,
        message:
          "I can proceed with assumptions now, but I need one concrete clarification to improve proposal precision.",
        proposal: session.proposal,
        session,
        iterations: iterationLogs,
      };
    }

    if (decisionResult.decision.action === "ask_question") {
      await persistSession(sessionId, session, {
        agentState: {
          ...session.agentState,
          currentStep: "ask_question",
        },
      });

      const questionResult = await generateQuestion({
        requirements: session.requirements,
        gaps: session.gaps,
        messages: session.messages,
      });

      const question = questionResult.questionPayload.question;

      const nextMessage = {
        role: "assistant",
        content: question,
        step: "ask_question",
        metadata: {
          rationale: questionResult.questionPayload.rationale,
          priority: questionResult.questionPayload.priority,
        },
        createdAt: new Date(),
      };

      const previousAssistantQuestion = [...session.messages]
        .reverse()
        .find(
          (message) =>
            message.role === "assistant" && message.step === "ask_question"
        )?.content;

      if (previousAssistantQuestion === question) {
        await persistSession(sessionId, session, {
          agentState: {
            ...session.agentState,
            status: "completed",
            currentStep: "completed",
            stopReason: "no_action",
          },
        });

        return {
          status: "no_action",
          thought: decisionResult.decision.thought,
          action: "no_action",
          reasoning:
            "The next clarification question would repeat a previous prompt, so the loop is stopping safely.",
          confidence: decisionResult.decision.confidence,
          message:
            "I can draft using assumptions, but I need one additional concrete detail to avoid repeating questions.",
          proposal: session.proposal,
          session,
          iterations: iterationLogs,
        };
      }

      session = await sessionRepository.appendMessage(sessionId, nextMessage);
      await persistSession(sessionId, session, {
        pendingQuestions: [question],
        agentState: {
          ...session.agentState,
          status: "waiting_for_user",
          currentStep: "awaiting_user_response",
          stopReason: null,
          lastError: questionResult.parsingSucceeded
            ? null
            : "Question generation returned invalid JSON. Fallback question applied.",
        },
      });

      return {
        status: "needs_user_input",
        thought: decisionResult.decision.thought,
        action: "ask_question",
        reasoning: decisionResult.decision.reasoning,
        confidence: decisionResult.decision.confidence,
        message: question,
        session,
        iterations: iterationLogs,
      };
    }

    if (decisionResult.decision.action === "revise_proposal") {
      await persistSession(sessionId, session, {
        agentState: {
          ...session.agentState,
          currentStep: "revise_proposal",
        },
      });

      const revisionResult = await reviseProposal({
        requirements: session.requirements,
        gaps: session.gaps,
        proposal: session.proposal,
        messages: session.messages,
        latestUserMessage,
      });

      session = await sessionRepository.appendMessage(sessionId, {
        role: "assistant",
        content: revisionResult.proposal.proposalText,
        step: "revise_proposal",
        metadata: {
          title: revisionResult.proposal.title,
          revisionNotes: revisionResult.proposal.revisionNotes,
        },
        createdAt: new Date(),
      });

      await persistSession(sessionId, session, {
        proposal: revisionResult.proposal,
        pendingQuestions: [],
        agentState: {
          ...session.agentState,
          status: "proposal_generated",
          currentStep: "completed",
          readyForProposal: true,
          stopReason: "proposal_ready",
          lastError: revisionResult.parsingSucceeded
            ? null
            : "Proposal revision returned invalid JSON. Fallback revision applied.",
        },
      });

      return {
        status: "completed",
        thought: decisionResult.decision.thought,
        action: "revise_proposal",
        reasoning: decisionResult.decision.reasoning,
        confidence: decisionResult.decision.confidence,
        message: revisionResult.proposal.proposalText,
        proposal: revisionResult.proposal,
        session,
        iterations: iterationLogs,
      };
    }

    await persistSession(sessionId, session, {
      agentState: {
        ...session.agentState,
        currentStep: "generate_proposal",
      },
    });

    const proposalResult = await generateProposal({
      requirements: session.requirements,
      gaps: session.gaps,
      messages: session.messages,
    });

    session = await sessionRepository.appendMessage(sessionId, {
      role: "assistant",
      content: proposalResult.proposal.proposalText,
      step: "generate_proposal",
      metadata: {
        title: proposalResult.proposal.title,
      },
      createdAt: new Date(),
    });

    await persistSession(sessionId, session, {
      proposal: proposalResult.proposal,
      pendingQuestions: [],
      agentState: {
        ...session.agentState,
        status: "proposal_generated",
        currentStep: "completed",
        readyForProposal: true,
        stopReason: "proposal_ready",
        lastError: proposalResult.parsingSucceeded
          ? null
          : "Proposal generation returned invalid JSON. Fallback proposal applied.",
      },
    });

    return {
      status: "completed",
      thought: decisionResult.decision.thought,
      action: "generate_proposal",
      reasoning: decisionResult.decision.reasoning,
      confidence: decisionResult.decision.confidence,
      message: proposalResult.proposal.proposalText,
      proposal: proposalResult.proposal,
      session,
      iterations: iterationLogs,
    };
  }

  await persistSession(sessionId, session, {
    agentState: {
      ...session.agentState,
      status: "completed",
      currentStep: "fallback",
      stopReason: "no_action",
      lastError:
        "Agent loop exited without generating a proposal or a follow-up question.",
    },
  });

  return {
    status: "no_action",
    thought: "The loop ended without a safe next action.",
    action: "no_action",
    reasoning:
      "The agent could not generate a proposal or a new clarifying question within the configured iteration budget.",
    confidence: session.agentState.confidence || 0,
    message:
      "I can proceed with an assumptions-based proposal now. Share any additional goals, deliverables, or timeline details if you want higher precision.",
    session,
    iterations: iterationLogs,
  };
}

module.exports = {
  runAgentLoop,
};
