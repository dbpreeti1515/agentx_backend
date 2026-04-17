const { randomUUID } = require("crypto");
const { runAgentLoop } = require("../agent/agentLoop");
const sessionRepository = require("../repositories/sessionRepository");
const { AppError } = require("./errors");
const logger = require("./logger");

async function processAgentMessage(payload) {
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (!message) {
    throw new AppError(
      "A non-empty message string is required.",
      400,
      "INVALID_REQUEST"
    );
  }

  const sessionId = payload.sessionId || randomUUID();
  let session = await sessionRepository.getOrCreateSession(sessionId);

  session = await sessionRepository.appendMessage(sessionId, {
    role: "user",
    content: message,
    step: "user_message",
    metadata: {},
    createdAt: new Date(),
  });

  session = await sessionRepository.updateSessionFields(sessionId, {
    pendingQuestions: [],
    agentState: {
      ...session.agentState,
      status: "processing",
      currentStep: "received_user_message",
      stopReason: null,
      lastError: null,
    },
  });

  logger.info({
    event: "agent_message_received",
    sessionId,
    messageLength: message.length,
  });

  const result = await runAgentLoop(session);

  return {
    sessionId,
    thought: result.thought,
    action: result.action,
    message: result.message,
    requirements: result.session.requirements,
    missingInfo: result.session.gaps?.missingInfo || [],
    risks: result.session.gaps?.risks || [],
    suggestions: result.session.gaps?.suggestions || [],
    pendingQuestions: result.session.pendingQuestions || [],
    proposal: result.proposal || result.session.proposal || null,
    confidence: result.confidence,
    reasoning: result.reasoning,
    status: result.status,
    iterations: result.iterations,
  };
}

module.exports = {
  processAgentMessage,
};
