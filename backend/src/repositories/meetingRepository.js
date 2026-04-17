const { randomUUID } = require("crypto");
const Meeting = require("../models/meetingModel");
const { isMongoConnected } = require("../db/connect");

const memoryMeetings = new Map();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createDefaultMeeting(
  meetingId,
  {
    salesName = "",
    meetingType = "instant",
    scheduledAt = null,
    title = "",
    clientName = "",
    agenda = "",
    durationMinutes = 30,
  } = {}
) {
  const normalizedType = meetingType === "scheduled" ? "scheduled" : "instant";
  const normalizedStatus = normalizedType === "scheduled" ? "scheduled" : "active";
  const startTime = normalizedType === "instant" ? new Date() : null;
  return {
    meetingId: meetingId || randomUUID(),
    meetingType: normalizedType,
    status: normalizedStatus,
    scheduledAt,
    startedAt: startTime,
    completedAt: null,
    title,
    clientName,
    agenda,
    durationMinutes,
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

async function createMeeting(payload) {
  const meetingId = randomUUID();
  const meeting = createDefaultMeeting(meetingId, payload);

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

async function listMeetings({ status } = {}) {
  if (isMongoConnected()) {
    const query = status ? { status } : {};
    return Meeting.find(query).sort({ updatedAt: -1 }).lean();
  }

  const meetings = Array.from(memoryMeetings.values());
  const filtered = status ? meetings.filter((meeting) => meeting.status === status) : meetings;
  return clone(
    filtered.sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    })
  );
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
  listMeetings,
  updateMeetingFields,
};
