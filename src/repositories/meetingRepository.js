const { randomUUID } = require("crypto");
const Meeting = require("../models/meetingModel");
const { isMongoConnected } = require("../db/connect");

const memoryMeetings = new Map();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createDefaultMeeting(meetingId, salesName = "") {
  return {
    meetingId: meetingId || randomUUID(),
    participants: [{ role: "sales", name: salesName || "Sales", joinedAt: new Date() }],
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
    proposalDraft: null,
    confidence: 0,
    copilot: {
      thought: "",
      action: "idle",
      suggestion: "",
      risks: [],
      missingInfo: [],
      confidence: 0,
    },
  };
}

function mergeEntity(target, patch) {
  const next = { ...target };

  Object.entries(patch || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      next[key] &&
      typeof next[key] === "object" &&
      !Array.isArray(next[key])
    ) {
      next[key] = { ...next[key], ...value };
      return;
    }

    next[key] = value;
  });

  next.updatedAt = new Date();
  return next;
}

async function createMeeting({ salesName }) {
  const meetingId = randomUUID();
  const meeting = createDefaultMeeting(meetingId, salesName);

  if (isMongoConnected()) {
    const created = await Meeting.create(meeting);
    return created.toObject();
  }

  memoryMeetings.set(meetingId, meeting);
  return clone(meeting);
}

async function getMeetingById(meetingId) {
  if (isMongoConnected()) {
    return Meeting.findOne({ meetingId }).lean();
  }

  return clone(memoryMeetings.get(meetingId) || null);
}

async function updateMeetingFields(meetingId, fields) {
  if (isMongoConnected()) {
    return Meeting.findOneAndUpdate(
      { meetingId },
      { $set: { ...fields } },
      { new: true, lean: true }
    );
  }

  const current = memoryMeetings.get(meetingId);
  if (!current) {
    return null;
  }

  const next = mergeEntity(current, fields);
  memoryMeetings.set(meetingId, next);
  return clone(next);
}

async function appendMeetingMessage(meetingId, message) {
  if (isMongoConnected()) {
    return Meeting.findOneAndUpdate(
      { meetingId },
      { $push: { messages: message } },
      { new: true, lean: true }
    );
  }

  const current = memoryMeetings.get(meetingId);
  if (!current) {
    return null;
  }

  const next = mergeEntity(current, {
    messages: [...current.messages, message],
  });
  memoryMeetings.set(meetingId, next);
  return clone(next);
}

async function ensureParticipant(meetingId, participant) {
  const meeting = await getMeetingById(meetingId);
  if (!meeting) {
    return null;
  }

  const exists = (meeting.participants || []).some(
    (item) =>
      item.role === participant.role &&
      (participant.name ? item.name === participant.name : true)
  );

  if (exists) {
    return meeting;
  }

  if (isMongoConnected()) {
    return Meeting.findOneAndUpdate(
      { meetingId },
      { $push: { participants: participant } },
      { new: true, lean: true }
    );
  }

  const next = mergeEntity(meeting, {
    participants: [...(meeting.participants || []), participant],
  });
  memoryMeetings.set(meetingId, next);
  return clone(next);
}

module.exports = {
  appendMeetingMessage,
  createMeeting,
  ensureParticipant,
  getMeetingById,
  updateMeetingFields,
};
