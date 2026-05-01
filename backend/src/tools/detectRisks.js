const { callStructuredLLM } = require("../services/llmService");
const { buildRiskDetectionPrompt } = require("../prompts/agentPrompts");
const {
  ensureArrayOfStrings,
  ensureString,
  validateKeys,
} = require("../services/jsonUtils");

function buildDeterministicRisks(requirements = {}, messages = []) {
  const risks = [];
  const summary = [];
  const latestMessage = [...messages].reverse().find((item) => item.role === "user")?.content || "";
  const normalizedLatest = latestMessage.toLowerCase();

  const timelineRisk =
    /(?:tomorrow|next week|2 days|48 hours|immediately|asap)/i.test(latestMessage) &&
    !requirements.deliverables?.length;
  const budgetMismatch =
    normalizedLatest.includes("cheap") ||
    normalizedLatest.includes("lower budget") ||
    normalizedLatest.includes("too expensive") ||
    normalizedLatest.includes("over budget");
  const scopeRisk =
    !requirements.projectSummary ||
    !requirements.deliverables?.length ||
    !requirements.objectives?.length;

  if (timelineRisk) {
    risks.push("The requested timeline may be unrealistic relative to the current level of scope definition.");
    summary.push("Timeline pressure detected.");
  }

  if (budgetMismatch) {
    risks.push("The conversation suggests budget pressure that may require phased delivery or scope reduction.");
    summary.push("Budget mismatch detected.");
  }

  if (scopeRisk) {
    risks.push("The scope is still vague, which could create delivery ambiguity and pricing risk.");
    summary.push("Scope ambiguity detected.");
  }

  return {
    risks,
    budgetMismatch,
    timelineRisk,
    scopeRisk,
    summary: summary.join(" ") || "No major risks detected.",
  };
}

async function detectRisks({ requirements, messages }) {
  const prompt = buildRiskDetectionPrompt({
    requirements,
    messages,
  });

  const result = await callStructuredLLM({
    prompt,
    fallback: () => buildDeterministicRisks(requirements, messages),
    retries: 0,
    options: {
      maxRetries: 0,
      maxTokens: 650,
    },
    validate: (payload) =>
      validateKeys(payload, [
        "risks",
        "budgetMismatch",
        "timelineRisk",
        "scopeRisk",
        "summary",
      ]),
  });

  const fallback = buildDeterministicRisks(requirements, messages);
  const riskPayload = result.parsingSucceeded ? { ...fallback, ...result.data } : fallback;

  riskPayload.risks = ensureArrayOfStrings(riskPayload.risks);
  riskPayload.summary = ensureString(riskPayload.summary, fallback.summary);
  riskPayload.budgetMismatch = Boolean(riskPayload.budgetMismatch);
  riskPayload.timelineRisk = Boolean(riskPayload.timelineRisk);
  riskPayload.scopeRisk = Boolean(riskPayload.scopeRisk);

  return {
    riskPayload,
    parsingSucceeded: result.parsingSucceeded,
    raw: result.raw,
  };
}

module.exports = {
  detectRisks,
};
