const { callStructuredLLM } = require("../services/llmService");
const { buildDecisionPrompt } = require("../prompts/agentPrompts");
const { calculateConfidence } = require("./confidenceEngine");
const { ensureInteger, ensureString, validateKeys } = require("../services/jsonUtils");

function summarizeConversation(messages = []) {
  return messages
    .slice(-6)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
}

function hasRequirements(requirements = {}) {
  return Boolean(
    requirements.projectSummary ||
      requirements.objectives?.length ||
      requirements.deliverables?.length
  );
}

function deterministicDecision({
  requirements,
  gaps,
  proposal,
  latestUserMessage,
  maxIterations,
  iteration,
}) {
  const noIterationsLeft = iteration >= maxIterations;
  const confidence = calculateConfidence(requirements, gaps);
  const hasMissingInfo = (gaps.missingInfo?.length || 0) > 0;
  const budgetConflict = Boolean(gaps.budgetConflict);

  if (!hasRequirements(requirements)) {
    return {
      thought: "The session lacks enough captured requirements to act confidently.",
      action: "extract_requirements",
      reasoning: "No meaningful requirements have been extracted yet.",
      confidence,
      readyForProposal: false,
      stop: false,
    };
  }

  if (budgetConflict && proposal) {
    return {
      thought: "The user appears to be negotiating scope, budget, or phased delivery.",
      action: "revise_proposal",
      reasoning:
        gaps.budgetConflictReason ||
        "A budget conflict was detected and a revision is more appropriate than a new proposal.",
      confidence,
      readyForProposal: false,
      stop: false,
    };
  }

  if (!noIterationsLeft && hasMissingInfo && !gaps.readyForProposal) {
    return {
      thought: "Key details are still missing, so clarification is the highest-value next step.",
      action: "ask_question",
      reasoning: "Important information is still missing before proposal generation.",
      confidence,
      readyForProposal: false,
      stop: false,
    };
  }

  if (confidence >= 72 || gaps.readyForProposal || noIterationsLeft) {
    return {
      thought: "The brief is strong enough to generate a commercially useful proposal.",
      action: "generate_proposal",
      reasoning: noIterationsLeft
        ? "The iteration limit was reached, so the agent should produce the best available proposal."
        : "Confidence is above the proposal threshold.",
      confidence,
      readyForProposal: true,
      stop: false,
    };
  }

  return {
    thought: "No productive next action is available without risking repetitive behavior.",
    action: "no_action",
    reasoning: latestUserMessage
      ? "The current context does not support a better next step."
      : "No new information is available for the agent to act on.",
    confidence,
    readyForProposal: false,
    stop: true,
  };
}

async function decideNextAction({
  requirements,
  gaps,
  proposal,
  messages,
  latestUserMessage,
  maxIterations,
  iteration,
}) {
  const fallback = deterministicDecision({
    requirements,
    gaps,
    proposal,
    latestUserMessage,
    maxIterations,
    iteration,
  });

  const prompt = buildDecisionPrompt({
    conversationSummary: summarizeConversation(messages),
    deterministicDecision: fallback,
  });

  const result = await callStructuredLLM({
    prompt,
    fallback,
    validate: (payload) =>
      validateKeys(payload, ["thought", "action", "reasoning", "confidence"]),
  });

  const decision = result.parsingSucceeded ? { ...fallback, ...result.data } : fallback;
  decision.action = fallback.action;
  decision.thought = ensureString(decision.thought, fallback.thought);
  decision.reasoning = ensureString(decision.reasoning, fallback.reasoning);
  decision.confidence = ensureInteger(decision.confidence, {
    min: 0,
    max: 100,
    fallback: fallback.confidence,
  });
  decision.readyForProposal = fallback.readyForProposal;
  decision.stop = fallback.stop;

  return {
    decision,
    parsingSucceeded: result.parsingSucceeded,
    raw: result.raw,
  };
}

module.exports = {
  decideNextAction,
};
