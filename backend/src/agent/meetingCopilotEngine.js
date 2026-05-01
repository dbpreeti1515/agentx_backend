const { extractRequirements } = require("../tools/extractRequirements");
const { identifyGaps } = require("../tools/identifyGaps");
const { detectRisks } = require("../tools/detectRisks");
const { generateSalesSuggestions } = require("../tools/generateSalesSuggestions");
const { generateProposal } = require("../tools/generateProposal");
const { reviseProposal } = require("../tools/reviseProposal");
const { calculateConfidence } = require("./confidenceEngine");
const logger = require("../services/logger");

function isOperationalSystemMessage(message = {}) {
  if (message.role !== "system") {
    return false;
  }
  const text = String(message.content || "").toLowerCase();
  return (
    text.includes("meeting started") ||
    text.includes("enabling camera") ||
    text.includes("unable to access camera")
  );
}

function resolveSpeaker(message = {}) {
  if (message.metadata?.senderName) {
    return message.metadata.senderName;
  }
  if (message.role === "sales") {
    return "Sales";
  }
  if (message.role === "client") {
    return "Client";
  }
  return "System";
}

function visibleConversation(messages = []) {
  return messages
    .filter((message) => message?.content && !isOperationalSystemMessage(message))
    .slice(-24)
    .map((message) => {
      const speaker = resolveSpeaker(message);
      const sourceRole = message.role || "system";
      return {
        role: "user",
        content: String(message.content || "").trim(),
        metadata: {
          speaker,
          sourceRole,
          visibility: "shared",
          createdAt: message.createdAt || null,
        },
      };
    });
}

function decideMeetingAction({ requirements, gapPayload, riskPayload, confidence, proposalDraft }) {
  const hasCoreRequirements = Boolean(
    requirements.projectSummary ||
      requirements.objectives?.length ||
      requirements.deliverables?.length
  );

  if (!hasCoreRequirements) {
    return {
      thought: "The conversation still needs core discovery details before strong guidance is possible.",
      action: "gather_context",
      reasoning: "The copilot should help sales collect foundational information first.",
    };
  }

  if (riskPayload.budgetMismatch && proposalDraft?.proposalText) {
    return {
      thought: "Budget pressure is visible, so the draft proposal should pivot toward phased or reduced scope options.",
      action: "revise_proposal",
      reasoning: "A revised proposal will better support the sales rep during negotiation.",
    };
  }

  if (gapPayload.missingInfo?.length) {
    return {
      thought: "Important gaps remain in the opportunity context.",
      action: "coach_sales",
      reasoning: "The best next step is guiding sales toward a focused follow-up question.",
    };
  }

  if (confidence >= 65) {
    return {
      thought: "The meeting is detailed enough to keep an updated proposal draft ready for the sales team.",
      action: "prepare_proposal",
      reasoning: "A background draft will help the sales user stay ahead of the conversation.",
    };
  }

  return {
    thought: "The copilot should continue surfacing practical next questions while the conversation develops.",
    action: "coach_sales",
    reasoning: "There is enough context to help, but not enough for a confident final proposal.",
  };
}

async function analyzeMeetingState(meeting) {
  const messages = visibleConversation(meeting.messages || []);

  const requirementResult = await extractRequirements({
    messages,
    currentRequirements: meeting.requirements,
  });

  const gapResult = await identifyGaps({
    requirements: requirementResult.requirements,
    messages,
  });

  const riskResult = await detectRisks({
    requirements: requirementResult.requirements,
    messages,
  });

  const mergedRisks = Array.from(
    new Set([...(gapResult.gaps.risks || []), ...(riskResult.riskPayload.risks || [])])
  );

  const mergedGapPayload = {
    ...gapResult.gaps,
    risks: mergedRisks,
    budgetConflict:
      Boolean(gapResult.gaps.budgetConflict) || Boolean(riskResult.riskPayload.budgetMismatch),
    budgetConflictReason:
      gapResult.gaps.budgetConflictReason || riskResult.riskPayload.summary || "",
  };

  const confidence = calculateConfidence(
    requirementResult.requirements,
    mergedGapPayload
  );

  const decision = decideMeetingAction({
    requirements: requirementResult.requirements,
    gapPayload: mergedGapPayload,
    riskPayload: riskResult.riskPayload,
    confidence,
    proposalDraft: meeting.proposalDraft,
  });

  const suggestionResult = await generateSalesSuggestions({
    requirements: requirementResult.requirements,
    missingInfo: mergedGapPayload.missingInfo,
    risks: mergedRisks,
    messages,
    recommendedAction: decision.action,
  });

  let proposalDraft = meeting.proposalDraft;

  if (decision.action === "revise_proposal" && meeting.proposalDraft?.proposalText) {
    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user")?.content;
    const revisionResult = await reviseProposal({
      requirements: requirementResult.requirements,
      gaps: mergedGapPayload,
      proposal: meeting.proposalDraft,
      messages,
      latestUserMessage,
    });
    proposalDraft = revisionResult.proposal;
  } else if (confidence >= 45) {
    const proposalResult = await generateProposal({
      requirements: requirementResult.requirements,
      gaps: mergedGapPayload,
      messages,
    });
    proposalDraft = proposalResult.proposal;
  }

  logger.info({
    event: "meeting_copilot_step",
    meetingId: meeting.meetingId,
    action: decision.action,
    confidence,
  });

  return {
    requirements: requirementResult.requirements,
    gaps: {
      ...mergedGapPayload,
      suggestions: Array.from(
        new Set([
          ...(mergedGapPayload.suggestions || []),
          ...suggestionResult.suggestionPayload.coachingTips,
        ])
      ),
    },
    proposalDraft,
    confidence,
    copilot: {
      thought: decision.thought,
      action: decision.action,
      suggestion: suggestionResult.suggestionPayload.suggestedQuestion,
      risks: mergedRisks,
      missingInfo: mergedGapPayload.missingInfo || [],
      confidence,
    },
  };
}

module.exports = {
  analyzeMeetingState,
};
