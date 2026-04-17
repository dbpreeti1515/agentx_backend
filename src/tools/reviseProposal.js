const { callStructuredLLM } = require("../services/llmService");
const { buildProposalRevisionPrompt } = require("../prompts/agentPrompts");
const {
  ensureArrayOfStrings,
  ensureString,
  validateKeys,
} = require("../services/jsonUtils");
const { buildFallbackProposal } = require("./generateProposal");

function buildFallbackRevision({ requirements, gaps, proposal, latestUserMessage }) {
  const fallback = buildFallbackProposal(requirements, gaps);
  const revisionNotes = [
    "Adjusted the proposal to better align with budget and scope constraints.",
    latestUserMessage ? `Negotiation context: ${latestUserMessage}` : null,
  ].filter(Boolean);

  return {
    ...fallback,
    title: proposal?.title || fallback.title,
    proposalText: proposal?.proposalText || fallback.proposalText,
    revisionNotes,
  };
}

async function reviseProposal({
  requirements,
  gaps,
  proposal,
  messages,
  latestUserMessage,
}) {
  const prompt = buildProposalRevisionPrompt({
    requirements,
    gaps,
    proposal,
    messages,
    latestUserMessage,
  });

  const result = await callStructuredLLM({
    prompt,
    fallback: () =>
      buildFallbackRevision({
        requirements,
        gaps,
        proposal,
        latestUserMessage,
      }),
    validate: (payload) =>
      validateKeys(payload, [
        "title",
        "executiveSummary",
        "scope",
        "deliverables",
        "timeline",
        "pricing",
        "assumptions",
        "nextSteps",
        "proposalText",
        "revisionNotes",
      ]),
    options: {
      maxTokens: 1800,
    },
  });

  const fallback = buildFallbackRevision({
    requirements,
    gaps,
    proposal,
    latestUserMessage,
  });
  const revisedProposal = result.parsingSucceeded
    ? { ...fallback, ...result.data }
    : fallback;

  revisedProposal.title = ensureString(revisedProposal.title, fallback.title);
  revisedProposal.executiveSummary = ensureString(
    revisedProposal.executiveSummary,
    fallback.executiveSummary
  );
  revisedProposal.scope = ensureArrayOfStrings(revisedProposal.scope);
  revisedProposal.deliverables = ensureArrayOfStrings(revisedProposal.deliverables);
  revisedProposal.timeline = ensureArrayOfStrings(revisedProposal.timeline);
  revisedProposal.assumptions = ensureArrayOfStrings(revisedProposal.assumptions);
  revisedProposal.nextSteps = ensureArrayOfStrings(revisedProposal.nextSteps);
  revisedProposal.revisionNotes = ensureArrayOfStrings(revisedProposal.revisionNotes);
  revisedProposal.proposalText = ensureString(
    revisedProposal.proposalText,
    fallback.proposalText
  );
  revisedProposal.pricing = revisedProposal.pricing && typeof revisedProposal.pricing === "object"
    ? {
        model: ensureString(revisedProposal.pricing.model, fallback.pricing.model),
        details: ensureArrayOfStrings(revisedProposal.pricing.details),
      }
    : fallback.pricing;

  return {
    proposal: revisedProposal,
    parsingSucceeded: result.parsingSucceeded,
    raw: result.raw,
  };
}

module.exports = {
  reviseProposal,
};
