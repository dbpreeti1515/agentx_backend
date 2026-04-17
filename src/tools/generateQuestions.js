const { callStructuredLLM } = require("../services/llmService");
const { buildQuestionPrompt } = require("../prompts/agentPrompts");
const { ensureString, validateKeys } = require("../services/jsonUtils");

function buildFallbackQuestion(gaps = {}) {
  const promptSource =
    gaps.missingInfo?.[0] ||
    gaps.missingRequirements?.[0] ||
    "the most important missing project detail";

  return {
    question: `Before I prepare the proposal, could you clarify ${promptSource.toLowerCase()}?`,
    rationale: "This detail is needed to improve proposal accuracy.",
    priority: "high",
  };
}

async function generateQuestion({ requirements, gaps, messages }) {
  const prompt = buildQuestionPrompt({
    requirements,
    gaps,
    messages,
  });

  const result = await callStructuredLLM({
    prompt,
    fallback: () => buildFallbackQuestion(gaps),
    validate: (payload) =>
      validateKeys(payload, ["question", "rationale", "priority"]),
  });

  const fallback = buildFallbackQuestion(gaps);
  const questionPayload = result.parsingSucceeded
    ? { ...fallback, ...result.data }
    : fallback;

  questionPayload.question = ensureString(questionPayload.question, fallback.question);
  questionPayload.rationale = ensureString(
    questionPayload.rationale,
    fallback.rationale
  );

  if (!["high", "medium", "low"].includes(questionPayload.priority)) {
    questionPayload.priority = fallback.priority;
  }

  return {
    questionPayload,
    parsingSucceeded: result.parsingSucceeded,
    raw: result.raw,
  };
}

module.exports = {
  generateQuestion,
};
