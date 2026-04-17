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

  const meeting = await meetingRepository.createMeeting({ salesName });

  return {
    meetingId: meeting.meetingId,
    joinLink: buildJoinLink(meeting.meetingId),
    dashboardLink: buildDashboardLink(meeting.meetingId),
  };
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

module.exports = {
  createMeeting,
  getMeetingState,
  postMeetingMessage,
};
