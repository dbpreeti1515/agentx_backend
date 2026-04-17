const { callStructuredLLM } = require("../services/llmService");
const { buildProposalPrompt } = require("../prompts/agentPrompts");
const {
  ensureArrayOfStrings,
  ensureString,
  validateKeys,
} = require("../services/jsonUtils");

function buildFallbackProposal(requirements = {}, gaps = {}) {
  const scope = requirements.deliverables?.length
    ? requirements.deliverables
    : ["Discovery, solution design, and proposal finalization based on current requirements."];

  const timeline = requirements.timeline
    ? [requirements.timeline]
    : ["Timeline to be finalized after confirming remaining discovery details."];

  const assumptions = [
    ...(gaps.missingInfo || []).slice(0, 3),
    "Final scope and commercials may be refined after stakeholder review.",
  ];

  const proposalText = [
    `# ${requirements.projectSummary || "AI Sales Solution Proposal"}`,
    "",
    "## Executive Summary",
    requirements.projectSummary ||
      "We propose an AI-driven solution tailored to the requirements shared so far.",
    "",
    "## Scope",
    ...scope.map((item) => `- ${item}`),
    "",
    "## Timeline",
    ...timeline.map((item) => `- ${item}`),
    "",
    "## Assumptions",
    ...assumptions.map((item) => `- ${item}`),
    "",
    "## Next Steps",
    "- Review this proposal",
    "- Confirm remaining open items",
    "- Finalize commercials and implementation kickoff",
  ].join("\n");

  return {
    title: requirements.projectSummary || "AI Sales Solution Proposal",
    executiveSummary:
      requirements.projectSummary ||
      "This proposal outlines the recommended AI sales solution based on the conversation so far.",
    scope,
    deliverables: scope,
    timeline,
    pricing: {
      model: requirements.budget ? "budget-informed" : "custom_quote",
      details: requirements.budget
        ? [`Current stated budget context: ${requirements.budget}`]
        : ["Pricing will be finalized after scope confirmation."],
    },
    assumptions,
    nextSteps: [
      "Review and approve the proposal direction.",
      "Answer any remaining clarification questions.",
      "Confirm implementation timing and commercials.",
    ],
    proposalText,
  };
}

async function generateProposal({ requirements, gaps, messages }) {
  const prompt = buildProposalPrompt({
    requirements,
    gaps,
    messages,
  });

  const result = await callStructuredLLM({
    prompt,
    fallback: () => buildFallbackProposal(requirements, gaps),
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
      ]),
    options: {
      maxTokens: 1800,
    },
  });

  const fallback = buildFallbackProposal(requirements, gaps);
  const proposal = result.parsingSucceeded
    ? { ...fallback, ...result.data }
    : fallback;

  proposal.title = ensureString(proposal.title, fallback.title);
  proposal.executiveSummary = ensureString(
    proposal.executiveSummary,
    fallback.executiveSummary
  );
  proposal.scope = ensureArrayOfStrings(proposal.scope);
  proposal.deliverables = ensureArrayOfStrings(proposal.deliverables);
  proposal.timeline = ensureArrayOfStrings(proposal.timeline);
  proposal.assumptions = ensureArrayOfStrings(proposal.assumptions);
  proposal.nextSteps = ensureArrayOfStrings(proposal.nextSteps);
  proposal.proposalText = ensureString(proposal.proposalText, fallback.proposalText);
  proposal.pricing = proposal.pricing && typeof proposal.pricing === "object"
    ? {
        model: ensureString(proposal.pricing.model, fallback.pricing.model),
        details: ensureArrayOfStrings(proposal.pricing.details),
      }
    : fallback.pricing;

  return {
    proposal,
    parsingSucceeded: result.parsingSucceeded,
    raw: result.raw,
  };
}

module.exports = {
  buildFallbackProposal,
  generateProposal,
};
