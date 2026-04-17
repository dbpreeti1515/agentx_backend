function formatConversation(messages = []) {
  if (!messages.length) {
    return "No conversation yet.";
  }

  return messages
    .slice(-12)
    .map((message) => {
      const speaker =
        message.metadata?.speaker ||
        message.metadata?.visibility ||
        message.role;

      return `${String(speaker).toUpperCase()}: ${message.content}`;
    })
    .join("\n");
}

function buildRequirementsPrompt({ messages, currentRequirements }) {
  return `
You are an AI sales solution architect.
Analyze the conversation and extract concrete proposal requirements.

Conversation:
${formatConversation(messages)}

Existing requirements:
${JSON.stringify(currentRequirements || {}, null, 2)}

Return valid JSON only with this exact shape:
{
  "projectSummary": "string",
  "objectives": ["string"],
  "targetAudience": ["string"],
  "deliverables": ["string"],
  "timeline": "string",
  "budget": "string",
  "technicalConstraints": ["string"],
  "successCriteria": ["string"],
  "tonePreferences": ["string"],
  "knownFacts": ["string"]
}

Rules:
- Preserve confirmed details from existing requirements when still valid.
- Use empty strings or empty arrays when information is missing.
- Keep each list concise and specific.
`.trim();
}

function buildGapPrompt({ requirements, messages }) {
  return `
You are reviewing sales discovery completeness before drafting a proposal.

Requirements:
${JSON.stringify(requirements || {}, null, 2)}

Conversation:
${formatConversation(messages)}

Return valid JSON only with this exact shape:
{
  "missingRequirements": ["string"],
  "missingInfo": ["string"],
  "risks": ["string"],
  "suggestions": ["string"],
  "readinessScore": 0,
  "readyForProposal": false,
  "budgetConflict": false,
  "budgetConflictReason": "string",
  "reasoning": "string"
}

Rules:
- readinessScore must be an integer from 0 to 100.
- readyForProposal should be true only when enough detail exists to draft a credible proposal.
- missingRequirements should list requirement categories still incomplete.
- missingInfo should contain concrete questions or facts still needed.
- risks should contain delivery or sales risks caused by ambiguity.
- suggestions should contain the most useful next actions.
- budgetConflict should be true if the conversation suggests the requested work conflicts with budget expectations.
`.trim();
}

function buildQuestionPrompt({ requirements, gaps, messages }) {
  return `
You are an AI sales agent gathering final missing details before preparing a proposal.

Requirements:
${JSON.stringify(requirements || {}, null, 2)}

Gap analysis:
${JSON.stringify(gaps || {}, null, 2)}

Conversation:
${formatConversation(messages)}

Return valid JSON only with this exact shape:
{
  "question": "string",
  "rationale": "string",
  "priority": "high"
}

Rules:
- Ask one focused question only.
- The question should unblock proposal quality the most.
- Keep the question natural and client-friendly.
- priority must be one of: "high", "medium", "low".
`.trim();
}

function buildProposalPrompt({ requirements, gaps, messages }) {
  return `
You are an expert B2B sales engineer writing a client-ready proposal.

Requirements:
${JSON.stringify(requirements || {}, null, 2)}

Gap analysis:
${JSON.stringify(gaps || {}, null, 2)}

Conversation:
${formatConversation(messages)}

Return valid JSON only with this exact shape:
{
  "title": "string",
  "executiveSummary": "string",
  "scope": ["string"],
  "deliverables": ["string"],
  "timeline": ["string"],
  "pricing": {
    "model": "string",
    "details": ["string"]
  },
  "assumptions": ["string"],
  "nextSteps": ["string"],
  "proposalText": "string"
}

Rules:
- Write a realistic proposal based only on available information.
- If budget is unknown, state pricing as a custom quote with clear assumptions.
- proposalText should be polished markdown suitable to send to a customer.
- Keep the content commercially useful and specific.
`.trim();
}

function buildProposalRevisionPrompt({
  requirements,
  gaps,
  proposal,
  messages,
  latestUserMessage,
}) {
  return `
You are revising a sales proposal during negotiation.

Requirements:
${JSON.stringify(requirements || {}, null, 2)}

Gap analysis:
${JSON.stringify(gaps || {}, null, 2)}

Current proposal:
${JSON.stringify(proposal || {}, null, 2)}

Latest user negotiation context:
${latestUserMessage || ""}

Conversation:
${formatConversation(messages)}

Return valid JSON only with this exact shape:
{
  "title": "string",
  "executiveSummary": "string",
  "scope": ["string"],
  "deliverables": ["string"],
  "timeline": ["string"],
  "pricing": {
    "model": "string",
    "details": ["string"]
  },
  "assumptions": ["string"],
  "nextSteps": ["string"],
  "proposalText": "string",
  "revisionNotes": ["string"]
}

Rules:
- Revise the proposal to address budget constraints, reduced scope, or phased delivery.
- Keep the proposal commercially credible and client-friendly.
- revisionNotes should clearly describe what changed.
`.trim();
}

function buildDecisionPrompt({
  conversationSummary,
  deterministicDecision,
}) {
  return `
You are summarizing a deterministic orchestration decision for an autonomous sales agent.

Conversation summary:
${conversationSummary}

Deterministic decision:
${JSON.stringify(deterministicDecision, null, 2)}

Return valid JSON only with this exact shape:
{
  "thought": "string",
  "action": "string",
  "reasoning": "string",
  "confidence": 0
}

Rules:
- Keep the action identical to the deterministic decision action.
- confidence must be an integer between 0 and 100.
- Do not invent a different next step.
`.trim();
}

function buildRiskDetectionPrompt({ requirements, messages }) {
  return `
You are an AI sales copilot monitoring a live sales conversation.

Requirements:
${JSON.stringify(requirements || {}, null, 2)}

Conversation:
${formatConversation(messages)}

Return valid JSON only with this exact shape:
{
  "risks": ["string"],
  "budgetMismatch": false,
  "timelineRisk": false,
  "scopeRisk": false,
  "summary": "string"
}

Rules:
- Focus on unrealistic timelines, budget mismatch, and vague scope.
- Keep risks specific and actionable for the sales rep.
`.trim();
}

function buildSalesSuggestionPrompt({
  requirements,
  missingInfo,
  risks,
  messages,
  recommendedAction,
}) {
  return `
You are an AI sales copilot assisting a seller during a live meeting.

Requirements:
${JSON.stringify(requirements || {}, null, 2)}

Missing information:
${JSON.stringify(missingInfo || [], null, 2)}

Detected risks:
${JSON.stringify(risks || [], null, 2)}

Recommended action:
${recommendedAction}

Conversation:
${formatConversation(messages)}

Return valid JSON only with this exact shape:
{
  "suggestedQuestion": "string",
  "coachingTips": ["string"],
  "rationale": "string"
}

Rules:
- The suggested question must be something the sales person should ask next.
- Coaching tips should be short, practical, and relevant to the current meeting context.
- Do not speak to the client directly. Assist the sales rep only.
`.trim();
}

module.exports = {
  buildDecisionPrompt,
  buildGapPrompt,
  buildProposalPrompt,
  buildProposalRevisionPrompt,
  buildQuestionPrompt,
  buildRiskDetectionPrompt,
  buildRequirementsPrompt,
  buildSalesSuggestionPrompt,
};
