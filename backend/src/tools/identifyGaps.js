const { callStructuredLLM } = require("../services/llmService");
const { buildGapPrompt } = require("../prompts/agentPrompts");
const {
  ensureArrayOfStrings,
  ensureInteger,
  ensureString,
  validateKeys,
} = require("../services/jsonUtils");

const fallbackGapResult = {
  missingRequirements: [],
  missingInfo: [],
  risks: [],
  suggestions: [],
  readinessScore: 0,
  readyForProposal: false,
  budgetConflict: false,
  budgetConflictReason: "",
  reasoning: "Gap analysis could not be parsed.",
};

function detectBudgetConflict(messages = []) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")?.content;

  if (!latestUserMessage) {
    return {
      budgetConflict: false,
      budgetConflictReason: "",
    };
  }

  const normalized = latestUserMessage.toLowerCase();
  const conflict =
    normalized.includes("too expensive") ||
    normalized.includes("over budget") ||
    normalized.includes("reduce scope") ||
    normalized.includes("phased") ||
    normalized.includes("lower budget") ||
    normalized.includes("cheaper");

  return {
    budgetConflict: conflict,
    budgetConflictReason: conflict
      ? "The user message suggests price pressure or a request to reduce scope."
      : "",
  };
}

function deterministicGapCheck(requirements = {}, messages = []) {
  const missingRequirements = [];
  const missingInfo = [];
  const suggestions = [];

  if (!requirements.projectSummary) {
    missingRequirements.push("projectSummary");
    missingInfo.push("Clarify the project summary and main problem to solve.");
    suggestions.push("Summarize the customer's core business problem.");
  }

  if (!requirements.objectives?.length) {
    missingRequirements.push("objectives");
    missingInfo.push("Clarify the primary business goals for this proposal.");
    suggestions.push("Confirm measurable business outcomes.");
  }

  if (!requirements.deliverables?.length) {
    missingRequirements.push("deliverables");
    missingInfo.push("Clarify the expected deliverables or scope of work.");
    suggestions.push("Define the deliverables and ownership clearly.");
  }

  if (!requirements.timeline) {
    missingRequirements.push("timeline");
    missingInfo.push("Clarify the desired timeline or deadline.");
    suggestions.push("Confirm the delivery window or go-live target.");
  }

  const readinessScore = Math.max(0, 100 - missingRequirements.length * 20);
  const budgetSignal = detectBudgetConflict(messages);

  return {
    missingRequirements,
    missingInfo,
    risks: missingRequirements.length
      ? ["Proposal accuracy may suffer because key discovery details are still missing."]
      : [],
    suggestions,
    readinessScore,
    readyForProposal: missingRequirements.length === 0,
    budgetConflict: budgetSignal.budgetConflict,
    budgetConflictReason: budgetSignal.budgetConflictReason,
    reasoning:
      missingRequirements.length === 0
        ? "Core proposal inputs are present."
        : "Several core proposal inputs are still incomplete.",
  };
}

async function identifyGaps({ requirements, messages }) {
  const prompt = buildGapPrompt({
    requirements,
    messages,
  });

  const result = await callStructuredLLM({
    prompt,
    fallback: () => deterministicGapCheck(requirements, messages),
    validate: (payload) =>
      validateKeys(payload, [
        "missingRequirements",
        "missingInfo",
        "risks",
        "suggestions",
        "readinessScore",
        "readyForProposal",
        "budgetConflict",
        "budgetConflictReason",
        "reasoning",
      ]),
  });

  const deterministicFallback = deterministicGapCheck(requirements, messages);

  const gapAnalysis = result.parsingSucceeded
    ? {
        ...fallbackGapResult,
        ...result.data,
      }
    : deterministicFallback;

  gapAnalysis.missingRequirements = ensureArrayOfStrings(
    gapAnalysis.missingRequirements
  );
  gapAnalysis.missingInfo = ensureArrayOfStrings(gapAnalysis.missingInfo);
  gapAnalysis.risks = ensureArrayOfStrings(gapAnalysis.risks);
  gapAnalysis.suggestions = ensureArrayOfStrings(gapAnalysis.suggestions);
  gapAnalysis.readinessScore = ensureInteger(gapAnalysis.readinessScore);
  gapAnalysis.budgetConflictReason = ensureString(gapAnalysis.budgetConflictReason);

  gapAnalysis.readyForProposal =
    Boolean(gapAnalysis.readyForProposal) ||
    (gapAnalysis.readinessScore >= 75 &&
      gapAnalysis.missingRequirements.length <= 1);
  gapAnalysis.budgetConflict = Boolean(gapAnalysis.budgetConflict);

  return {
    gaps: gapAnalysis,
    parsingSucceeded: result.parsingSucceeded,
    raw: result.raw,
  };
}

module.exports = {
  identifyGaps,
};
