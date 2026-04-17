const { callStructuredLLM } = require("../services/llmService");
const { buildSalesSuggestionPrompt } = require("../prompts/agentPrompts");
const {
  ensureArrayOfStrings,
  ensureString,
  validateKeys,
} = require("../services/jsonUtils");

function buildFallbackSuggestion({ missingInfo = [], risks = [], action }) {
  const primaryMissingInfo = missingInfo[0];
  const primaryRisk = risks[0];

  return {
    suggestedQuestion: primaryMissingInfo
      ? `Ask the client to clarify: ${primaryMissingInfo}`
      : "Ask the client to confirm their highest-priority business outcome for this initiative.",
    coachingTips: [
      action === "prepare_proposal"
        ? "Confirm buying criteria before presenting the draft proposal."
        : "Keep the next question specific and tied to business impact.",
      primaryRisk
        ? `Address this risk early: ${primaryRisk}`
        : "Recap what is already confirmed before moving deeper into scope.",
    ],
    rationale:
      "The suggestion is based on the strongest open information gap and the current meeting risk profile.",
  };
}

async function generateSalesSuggestions({
  requirements,
  missingInfo,
  risks,
  messages,
  recommendedAction,
}) {
  const prompt = buildSalesSuggestionPrompt({
    requirements,
    missingInfo,
    risks,
    messages,
    recommendedAction,
  });

  const result = await callStructuredLLM({
    prompt,
    fallback: () =>
      buildFallbackSuggestion({
        missingInfo,
        risks,
        action: recommendedAction,
      }),
    validate: (payload) =>
      validateKeys(payload, ["suggestedQuestion", "coachingTips", "rationale"]),
  });

  const fallback = buildFallbackSuggestion({
    missingInfo,
    risks,
    action: recommendedAction,
  });
  const suggestionPayload = result.parsingSucceeded
    ? { ...fallback, ...result.data }
    : fallback;

  suggestionPayload.suggestedQuestion = ensureString(
    suggestionPayload.suggestedQuestion,
    fallback.suggestedQuestion
  );
  suggestionPayload.coachingTips = ensureArrayOfStrings(
    suggestionPayload.coachingTips
  );
  suggestionPayload.rationale = ensureString(
    suggestionPayload.rationale,
    fallback.rationale
  );

  return {
    suggestionPayload,
    parsingSucceeded: result.parsingSucceeded,
    raw: result.raw,
  };
}

module.exports = {
  generateSalesSuggestions,
};
