const { callStructuredLLM } = require("../services/llmService");
const { buildRequirementsPrompt } = require("../prompts/agentPrompts");
const {
  ensureArrayOfStrings,
  ensureString,
  validateKeys,
} = require("../services/jsonUtils");

const emptyRequirements = {
  projectSummary: "",
  objectives: [],
  targetAudience: [],
  deliverables: [],
  timeline: "",
  budget: "",
  technicalConstraints: [],
  successCriteria: [],
  tonePreferences: [],
  knownFacts: [],
};

function buildFallbackRequirements(messages = [], currentRequirements = {}) {
  const base = { ...emptyRequirements, ...(currentRequirements || {}) };
  const visibleMessages = (messages || [])
    .filter((message) => {
      const content = String(message?.content || "").trim();
      if (!content) {
        return false;
      }
      const speaker = String(
        message?.metadata?.speaker || message?.metadata?.sourceRole || message?.role || ""
      ).toLowerCase();
      if (!["sales", "client", "user"].includes(speaker)) {
        return false;
      }
      return true;
    })
    .slice(-8);

  if (!visibleMessages.length) {
    return base;
  }

  const lastLines = visibleMessages.map((message) => String(message.content).trim());
  const latestMessage = lastLines[lastLines.length - 1] || "";
  const projectSummary =
    base.projectSummary ||
    (latestMessage.length > 180 ? `${latestMessage.slice(0, 177)}...` : latestMessage);

  const knownFacts = Array.from(new Set([...(base.knownFacts || []), ...lastLines])).slice(-10);

  return {
    ...base,
    projectSummary,
    knownFacts,
  };
}

function mergeRequirements(existing, extracted) {
  const base = { ...emptyRequirements, ...(existing || {}) };
  const incoming = { ...emptyRequirements, ...(extracted || {}) };

  return {
    projectSummary: incoming.projectSummary || base.projectSummary || "",
    objectives: incoming.objectives.length ? incoming.objectives : base.objectives || [],
    targetAudience: incoming.targetAudience.length
      ? incoming.targetAudience
      : base.targetAudience || [],
    deliverables: incoming.deliverables.length
      ? incoming.deliverables
      : base.deliverables || [],
    timeline: incoming.timeline || base.timeline || "",
    budget: incoming.budget || base.budget || "",
    technicalConstraints: incoming.technicalConstraints.length
      ? incoming.technicalConstraints
      : base.technicalConstraints || [],
    successCriteria: incoming.successCriteria.length
      ? incoming.successCriteria
      : base.successCriteria || [],
    tonePreferences: incoming.tonePreferences.length
      ? incoming.tonePreferences
      : base.tonePreferences || [],
    knownFacts: Array.from(
      new Set([...(base.knownFacts || []), ...(incoming.knownFacts || [])])
    ),
  };
}

async function extractRequirements({ messages, currentRequirements }) {
  const prompt = buildRequirementsPrompt({
    messages,
    currentRequirements,
  });

  const result = await callStructuredLLM({
    prompt,
    fallback: () => buildFallbackRequirements(messages, currentRequirements),
    retries: 1,
    options: {
      maxRetries: 1,
      maxTokens: 900,
    },
    validate: (payload) =>
      validateKeys(payload, [
        "projectSummary",
        "objectives",
        "targetAudience",
        "deliverables",
        "timeline",
        "budget",
        "technicalConstraints",
        "successCriteria",
        "tonePreferences",
        "knownFacts",
      ]),
  });

  const normalized = {
    projectSummary: ensureString(result.data.projectSummary),
    objectives: ensureArrayOfStrings(result.data.objectives),
    targetAudience: ensureArrayOfStrings(result.data.targetAudience),
    deliverables: ensureArrayOfStrings(result.data.deliverables),
    timeline: ensureString(result.data.timeline),
    budget: ensureString(result.data.budget),
    technicalConstraints: ensureArrayOfStrings(result.data.technicalConstraints),
    successCriteria: ensureArrayOfStrings(result.data.successCriteria),
    tonePreferences: ensureArrayOfStrings(result.data.tonePreferences),
    knownFacts: ensureArrayOfStrings(result.data.knownFacts),
  };

  return {
    requirements: mergeRequirements(currentRequirements, normalized),
    parsingSucceeded: result.parsingSucceeded,
    raw: result.raw,
  };
}

module.exports = {
  extractRequirements,
};
