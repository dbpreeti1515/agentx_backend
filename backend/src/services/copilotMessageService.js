const { randomUUID } = require("crypto");
const sessionRepository = require("../repositories/sessionRepository");
const { AppError } = require("./errors");
const logger = require("./logger");
const { runCopilotLoop } = require("../agent/copilotEngine");

async function processCopilotMessage(payload) {
  const role = typeof payload.role === "string" ? payload.role.trim().toLowerCase() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (!message) {
    throw new AppError(
      "A non-empty message string is required.",
      400,
      "INVALID_REQUEST"
    );
  }

  if (!["client", "sales"].includes(role)) {
    throw new AppError(
      "role must be either 'client' or 'sales'.",
      400,
      "INVALID_ROLE"
    );
  }

  const sessionId = payload.sessionId || randomUUID();
  let session = await sessionRepository.getOrCreateSession(sessionId);

  session = await sessionRepository.appendMessage(sessionId, {
    role: "user",
    content: message,
    step: "meeting_message",
    metadata: {
      speaker: role,
      mode: "copilot",
    },
    createdAt: new Date(),
  });

  session = await sessionRepository.updateSessionFields(sessionId, {
    agentState: {
      ...session.agentState,
      status: "processing",
      currentStep: "copilot_received_message",
      stopReason: null,
      lastError: null,
    },
  });

  logger.info({
    event: "copilot_message_received",
    sessionId,
    speaker: role,
    messageLength: message.length,
  });

  const result = await runCopilotLoop(session);

  return {
    sessionId,
    thought: result.thought,
    action: result.action,
    suggestion: result.suggestion,
    risks: result.risks,
    missingInfo: result.missingInfo,
    requirements: result.requirements,
    proposalDraft: result.proposalDraft,
    confidence: result.confidence,
    coachingTips: result.coachingTips,
  };
}

module.exports = {
  processCopilotMessage,
};
