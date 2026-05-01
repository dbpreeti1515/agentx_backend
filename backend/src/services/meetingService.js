const meetingRepository = require("../repositories/meetingRepository");
const { analyzeMeetingState } = require("../agent/meetingCopilotEngine");
const { AppError } = require("./errors");

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

function buildJoinLink(meetingId) {
  return `${FRONTEND_BASE_URL}/meet/${meetingId}`;
}

function buildDashboardLink(meetingId) {
  return `${FRONTEND_BASE_URL}/dashboard/meeting/${meetingId}`;
}

function sanitizeMeetingSummary(meeting) {
  return {
    meetingId: meeting.meetingId,
    meetingType: meeting.meetingType || "instant",
    status: meeting.status || "active",
    title: meeting.title || "",
    clientName: meeting.clientName || "",
    agenda: meeting.agenda || "",
    durationMinutes: meeting.durationMinutes || 30,
    scheduledAt: meeting.scheduledAt || null,
    startedAt: meeting.startedAt || null,
    completedAt: meeting.completedAt || null,
    createdAt: meeting.createdAt || null,
    updatedAt: meeting.updatedAt || null,
    joinLink: buildJoinLink(meeting.meetingId),
    dashboardLink: buildDashboardLink(meeting.meetingId),
    participantCount: (meeting.participants || []).length,
    lastMessageAt:
      meeting.messages?.[meeting.messages.length - 1]?.createdAt || meeting.updatedAt || null,
    confidence: meeting.confidence || 0,
  };
}

function sanitizeMeetingForRole(meeting, role, participantName) {
  const allMessages = meeting.messages || [];
  let messages = allMessages;

  if (role === "client") {
    messages = allMessages.filter((message) => {
      if (message.role === "sales" || message.role === "system") {
        return true;
      }

      return (
        message.role === "client" &&
        participantName &&
        message.metadata?.senderName === participantName
      );
    });
  }

  return {
    meetingId: meeting.meetingId,
    meetingType: meeting.meetingType || "instant",
    status: meeting.status || "active",
    title: meeting.title || "",
    clientName: meeting.clientName || "",
    agenda: meeting.agenda || "",
    durationMinutes: meeting.durationMinutes || 30,
    scheduledAt: meeting.scheduledAt || null,
    startedAt: meeting.startedAt || null,
    completedAt: meeting.completedAt || null,
    joinLink: buildJoinLink(meeting.meetingId),
    dashboardLink: buildDashboardLink(meeting.meetingId),
    participants: meeting.participants || [],
    messages,
    requirements: role === "sales" ? meeting.requirements : undefined,
    missingInfo: role === "sales" ? meeting.gaps?.missingInfo || [] : undefined,
    risks: role === "sales" ? meeting.copilot?.risks || [] : undefined,
    proposalDraft: role === "sales" ? meeting.proposalDraft || null : undefined,
    confidence: role === "sales" ? meeting.confidence || 0 : undefined,
    thought: role === "sales" ? meeting.copilot?.thought || "" : undefined,
    action: role === "sales" ? meeting.copilot?.action || "idle" : undefined,
    suggestion: role === "sales" ? meeting.copilot?.suggestion || "" : undefined,
  };
}

async function createMeeting(payload) {
  const salesName =
    typeof payload.salesName === "string" && payload.salesName.trim()
      ? payload.salesName.trim()
      : "Sales";

  const meetingType = payload.meetingType === "scheduled" ? "scheduled" : "instant";
  const scheduledAt =
    meetingType === "scheduled" && payload.scheduledAt
      ? new Date(payload.scheduledAt)
      : null;
  const isScheduleValid =
    !scheduledAt || Number.isNaN(scheduledAt.getTime()) === false;

  if (meetingType === "scheduled" && !isScheduleValid) {
    throw new AppError("A valid scheduledAt date is required for scheduled meetings.", 400, "INVALID_SCHEDULE");
  }

  const meeting = await meetingRepository.createMeeting({ 
    salesName,
    meetingType,
    scheduledAt,
    title: typeof payload.title === "string" ? payload.title.trim() : "",
    clientName: typeof payload.clientName === "string" ? payload.clientName.trim() : "",
    agenda: typeof payload.agenda === "string" ? payload.agenda.trim() : "",
    durationMinutes: Number(payload.durationMinutes) > 0 ? Number(payload.durationMinutes) : 30,
  });

  return sanitizeMeetingSummary(meeting);
}

async function listMeetings({ status } = {}) {
  const normalizedStatus = ["scheduled", "active", "completed"].includes(status) ? status : "";
  const meetings = await meetingRepository.listMeetings({
    status: normalizedStatus || undefined,
  });
  return meetings.map(sanitizeMeetingSummary);
}

async function startMeeting({ meetingId }) {
  if (!meetingId) {
    throw new AppError("meetingId is required.", 400, "INVALID_MEETING_ID");
  }

  let meeting = await meetingRepository.getMeetingById(meetingId);
  if (!meeting) {
    throw new AppError("Meeting not found.", 404, "MEETING_NOT_FOUND");
  }

  if (meeting.status === "completed") {
    throw new AppError("Completed meetings cannot be started again.", 409, "MEETING_COMPLETED");
  }

  if (meeting.status !== "active") {
    meeting = await meetingRepository.updateMeetingFields(meetingId, {
      status: "active",
      startedAt: new Date(),
    });
    meeting = await meetingRepository.appendMeetingMessage(meetingId, {
      role: "system",
      content: "Meeting started. Agent capture is active and proposal intelligence is being collected.",
      metadata: { senderName: "AgentX", visibility: "shared" },
      createdAt: new Date(),
    });
  }

  return sanitizeMeetingSummary(meeting);
}

async function postMeetingMessage(payload) {
  const meetingId =
    typeof payload.meetingId === "string" ? payload.meetingId.trim() : "";
  const role = typeof payload.role === "string" ? payload.role.trim().toLowerCase() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const participantName =
    typeof payload.participantName === "string" ? payload.participantName.trim() : "";

  if (!meetingId) {
    throw new AppError("meetingId is required.", 400, "INVALID_MEETING_ID");
  }

  if (!["sales", "client"].includes(role)) {
    throw new AppError("role must be either 'sales' or 'client'.", 400, "INVALID_ROLE");
  }

  if (!message) {
    throw new AppError("A non-empty message string is required.", 400, "INVALID_MESSAGE");
  }

  let meeting = await meetingRepository.getMeetingById(meetingId);

  if (!meeting) {
    throw new AppError("Meeting not found.", 404, "MEETING_NOT_FOUND");
  }
  if (meeting.status === "scheduled") {
    throw new AppError(
      "Meeting is scheduled and not started yet. Start it from the dashboard first.",
      409,
      "MEETING_NOT_STARTED"
    );
  }
  if (meeting.status === "completed") {
    throw new AppError("Meeting is already completed.", 409, "MEETING_COMPLETED");
  }

  if (participantName) {
    meeting = await meetingRepository.ensureParticipant(meetingId, {
      role,
      name: participantName,
      joinedAt: new Date(),
    });
  }

  meeting = await meetingRepository.appendMeetingMessage(meetingId, {
    role,
    content: message,
    metadata: {
      senderName: participantName || role,
      visibility: "shared",
    },
    createdAt: new Date(),
  });

  const analysis = await analyzeMeetingState(meeting);
  meeting = await meetingRepository.updateMeetingFields(meetingId, analysis);

  return {
    thought: meeting.copilot?.thought || "",
    action: meeting.copilot?.action || "idle",
    suggestion: meeting.copilot?.suggestion || "",
    risks: meeting.copilot?.risks || [],
    missingInfo: meeting.gaps?.missingInfo || [],
    requirements: meeting.requirements,
    proposalDraft: meeting.proposalDraft || null,
    confidence: meeting.confidence || 0,
  };
}

async function getMeetingInsights({ meetingId }) {
  if (!meetingId) {
    throw new AppError("meetingId is required.", 400, "INVALID_MEETING_ID");
  }

  const meeting = await meetingRepository.getMeetingById(meetingId);

  if (!meeting) {
    throw new AppError("Meeting not found.", 404, "MEETING_NOT_FOUND");
  }

  // Insights are sales-focused
  return {
    requirements: meeting.requirements,
    missingInfo: meeting.gaps?.missingInfo || [],
    risks: meeting.copilot?.risks || [],
    confidence: meeting.confidence || 0,
    suggestion: meeting.copilot?.suggestion || "",
    isReady: meeting.gaps?.readyForProposal || false,
  };
}

async function getMeetingState({ meetingId, role, participantName }) {
  if (!meetingId) {
    throw new AppError("meetingId is required.", 400, "INVALID_MEETING_ID");
  }

  const meeting = await meetingRepository.getMeetingById(meetingId);

  if (!meeting) {
    throw new AppError("Meeting not found.", 404, "MEETING_NOT_FOUND");
  }

  const normalizedRole = role === "client" ? "client" : "sales";
  return sanitizeMeetingForRole(meeting, normalizedRole, participantName);
}

async function finalizeMeeting({ meetingId }) {
  if (!meetingId) {
    throw new AppError("meetingId is required.", 400, "INVALID_MEETING_ID");
  }

  let meeting = await meetingRepository.getMeetingById(meetingId);

  if (!meeting) {
    throw new AppError("Meeting not found.", 404, "MEETING_NOT_FOUND");
  }

  // Update meeting state one last time if needed (e.g. mark as closed)
  meeting = await meetingRepository.updateMeetingFields(meetingId, {
    status: "completed",
    completedAt: new Date(),
  });

  return {
    summary: "Meeting finalized and intelligence captured.",
    meetingId: meeting.meetingId,
    finalProposalReady: meeting.confidence > 70,
    requirementsCaptured: Object.values(meeting.requirements || {}).filter(Boolean).length,
  };
}

module.exports = {
  createMeeting,
  listMeetings,
  startMeeting,
  getMeetingState,
  postMeetingMessage,
  getMeetingInsights,
  finalizeMeeting,
};
