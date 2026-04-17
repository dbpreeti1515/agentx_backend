const sessionRepository = require("../repositories/sessionRepository");
const logger = require("../services/logger");
const { extractRequirements } = require("../tools/extractRequirements");
const { identifyGaps } = require("../tools/identifyGaps");
const { detectRisks } = require("../tools/detectRisks");
const { generateSalesSuggestions } = require("../tools/generateSalesSuggestions");
const { generateProposal } = require("../tools/generateProposal");
const { reviseProposal } = require("../tools/reviseProposal");
const { calculateConfidence } = require("./confidenceEngine");

async function persistSession(sessionId, session, fields) {
  const nextState = await sessionRepository.updateSessionFields(sessionId, fields);
  Object.assign(session, nextState);
  return session;
}

function decideCopilotAction({ requirements, gapPayload, riskPayload, confidence, proposal }) {
  const hasCoreRequirements = Boolean(
    requirements.projectSummary ||
      requirements.objectives?.length ||
      requirements.deliverables?.length
  );

  if (!hasCoreRequirements) {
    return {
      thought: "The meeting context is still sparse, so the copilot should prioritize discovery guidance.",
      action: "gather_context",
      reasoning: "Not enough structured information exists yet to support a reliable proposal draft.",
    };
  }

  if (riskPayload.budgetMismatch && proposal?.proposalText) {
    return {
      thought: "Budget pressure is emerging and the current proposal likely needs reframing.",
      action: "revise_proposal",
      reasoning: "A revised phased or lower-scope draft will better support the seller during negotiation.",
    };
  }

  if (gapPayload.missingInfo?.length) {
    return {
      thought: "There are still critical discovery gaps affecting solution accuracy.",
      action: "coach_sales",
      reasoning: "The next best move is to guide the sales rep toward a focused follow-up question.",
    };
  }

  if (confidence >= 65) {
    return {
      thought: "The opportunity context is strong enough to keep a proposal draft warm in the background.",
      action: "prepare_proposal",
      reasoning: "Confidence is high enough to maintain an evolving proposal draft while the meeting continues.",
    };
  }

  return {
    thought: "The copilot should keep coaching the sales rep while requirements mature further.",
    action: "coach_sales",
    reasoning: "The meeting is progressing, but additional clarification would still reduce risk.",
  };
}

async function runCopilotLoop(session) {
  const sessionId = session.sessionId;

  await persistSession(sessionId, session, {
    agentState: {
      ...session.agentState,
      status: "processing",
      currentStep: "copilot_extract_requirements",
      stopReason: null,
      lastError: null,
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
      currentStep: "copilot_identify_gaps",
      lastError: requirementResult.parsingSucceeded
        ? null
        : "Copilot requirement extraction fallback applied.",
    },
  });

  const gapResult = await identifyGaps({
    requirements: session.requirements,
    messages: session.messages,
  });

  const riskResult = await detectRisks({
    requirements: session.requirements,
    messages: session.messages,
  });

  const mergedRisks = Array.from(
    new Set([...(gapResult.gaps.risks || []), ...(riskResult.riskPayload.risks || [])])
  );
  const mergedSuggestions = Array.from(
    new Set([...(gapResult.gaps.suggestions || [])])
  );
  const mergedGapPayload = {
    ...gapResult.gaps,
    risks: mergedRisks,
    suggestions: mergedSuggestions,
    budgetConflict:
      Boolean(gapResult.gaps.budgetConflict) || Boolean(riskResult.riskPayload.budgetMismatch),
    budgetConflictReason:
      gapResult.gaps.budgetConflictReason || riskResult.riskPayload.summary || "",
  };

  const confidence = calculateConfidence(session.requirements, mergedGapPayload);
  const decision = decideCopilotAction({
    requirements: session.requirements,
    gapPayload: mergedGapPayload,
    riskPayload: riskResult.riskPayload,
    confidence,
    proposal: session.proposal,
  });

  const suggestionResult = await generateSalesSuggestions({
    requirements: session.requirements,
    missingInfo: mergedGapPayload.missingInfo,
    risks: mergedRisks,
    messages: session.messages,
    recommendedAction: decision.action,
  });

  let proposalDraft = session.proposal;

  if (decision.action === "revise_proposal" && session.proposal?.proposalText) {
    const latestUserMessage = [...session.messages]
      .reverse()
      .find((message) => message.role === "user")?.content;

    const revisionResult = await reviseProposal({
      requirements: session.requirements,
      gaps: mergedGapPayload,
      proposal: session.proposal,
      messages: session.messages,
      latestUserMessage,
    });

    proposalDraft = revisionResult.proposal;
  } else if (confidence >= 45) {
    const proposalResult = await generateProposal({
      requirements: session.requirements,
      gaps: mergedGapPayload,
      messages: session.messages,
    });

    proposalDraft = proposalResult.proposal;
  }

  await persistSession(sessionId, session, {
    gaps: {
      ...mergedGapPayload,
      suggestions: Array.from(
        new Set([
          ...mergedSuggestions,
          ...suggestionResult.suggestionPayload.coachingTips,
        ])
      ),
    },
    proposal: proposalDraft,
    agentState: {
      ...session.agentState,
      status: "copilot_ready",
      currentStep: "completed",
      lastDecision: decision.action,
      lastThought: decision.thought,
      confidence,
      readyForProposal: confidence >= 65,
      stopReason: null,
    },
  });

  logger.info({
    event: "copilot_step",
    sessionId,
    action: decision.action,
    confidence,
    suggestion: suggestionResult.suggestionPayload.suggestedQuestion,
  });

  return {
    thought: decision.thought,
    action: decision.action,
    suggestion: suggestionResult.suggestionPayload.suggestedQuestion,
    reasoning: decision.reasoning,
    risks: mergedRisks,
    missingInfo: mergedGapPayload.missingInfo || [],
    requirements: session.requirements,
    proposalDraft,
    confidence,
    coachingTips: suggestionResult.suggestionPayload.coachingTips,
    session,
  };
}

module.exports = {
  runCopilotLoop,
};
