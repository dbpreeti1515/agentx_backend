const { randomUUID } = require("crypto");
const Session = require("../models/sessionModel");
const { isMongoConnected } = require("../db/connect");

const memorySessions = new Map();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createDefaultSession(sessionId) {
  return {
    sessionId: sessionId || randomUUID(),
    messages: [],
    requirements: {
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
    },
    gaps: {
      missingRequirements: [],
      missingInfo: [],
      risks: [],
      suggestions: [],
      readinessScore: 0,
      readyForProposal: false,
      budgetConflict: false,
      budgetConflictReason: "",
    },
    pendingQuestions: [],
    proposal: null,
    agentState: {
      status: "idle",
      currentStep: null,
      lastDecision: null,
      lastThought: null,
      iterations: 0,
      readyForProposal: false,
      confidence: 0,
      stopReason: null,
      lastError: null,
    },
  };
}

function mergeSession(target, patch) {
  const nextSession = { ...target };

  Object.entries(patch || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      nextSession[key] = { ...target[key], ...value };
      return;
    }

    nextSession[key] = value;
  });

  nextSession.updatedAt = new Date();
  return nextSession;
}

async function getOrCreateSession(sessionId) {
  if (isMongoConnected()) {
    const session = await Session.findOneAndUpdate(
      { sessionId },
      {
        $setOnInsert: createDefaultSession(sessionId),
      },
      {
        upsert: true,
        new: true,
        lean: true,
      }
    );

    return session;
  }

  const resolvedSessionId = sessionId || randomUUID();

  if (!memorySessions.has(resolvedSessionId)) {
    memorySessions.set(resolvedSessionId, createDefaultSession(resolvedSessionId));
  }

  return clone(memorySessions.get(resolvedSessionId));
}

async function updateSessionFields(sessionId, fields) {
  if (isMongoConnected()) {
    return Session.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          ...fields,
        },
      },
      {
        new: true,
        lean: true,
      }
    );
  }

  const current = memorySessions.get(sessionId) || createDefaultSession(sessionId);
  const next = mergeSession(current, fields);
  memorySessions.set(sessionId, next);
  return clone(next);
}

async function appendMessage(sessionId, message) {
  if (isMongoConnected()) {
    return Session.findOneAndUpdate(
      { sessionId },
      {
        $push: { messages: message },
      },
      {
        new: true,
        lean: true,
      }
    );
  }

  const current = memorySessions.get(sessionId) || createDefaultSession(sessionId);
  const next = mergeSession(current, {
    messages: [...current.messages, message],
  });
  memorySessions.set(sessionId, next);
  return clone(next);
}

module.exports = {
  appendMessage,
  getOrCreateSession,
  updateSessionFields,
};
