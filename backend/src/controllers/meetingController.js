const { asyncHandler } = require("../middleware/asyncHandler");
const { buildSuccessResponse } = require("../services/responseService");
const {
  createMeeting,
  listMeetings,
  startMeeting,
  getMeetingState,
  postMeetingMessage,
  getMeetingInsights,
  finalizeMeeting,
} = require("../services/meetingService");

const createMeetingController = asyncHandler(async (req, res) => {
  const result = await createMeeting(req.body || {});
  res.json(buildSuccessResponse(result));
});

const postMeetingMessageController = asyncHandler(async (req, res) => {
  const result = await postMeetingMessage(req.body || {});
  res.json(buildSuccessResponse(result));
});

const listMeetingsController = asyncHandler(async (req, res) => {
  const result = await listMeetings({
    status: req.query.status,
  });
  res.json(buildSuccessResponse(result));
});

const startMeetingController = asyncHandler(async (req, res) => {
  const result = await startMeeting({
    meetingId: req.params.meetingId,
  });
  res.json(buildSuccessResponse(result));
});

const getMeetingController = asyncHandler(async (req, res) => {
  const result = await getMeetingState({
    meetingId: req.params.meetingId,
    role: req.query.role,
    participantName: req.query.participantName,
  });
  res.json(buildSuccessResponse(result));
});

const getMeetingInsightsController = asyncHandler(async (req, res) => {
  const result = await getMeetingInsights({
    meetingId: req.params.meetingId,
  });
  res.json(buildSuccessResponse(result));
});

const finalizeMeetingController = asyncHandler(async (req, res) => {
  const result = await finalizeMeeting({
    meetingId: req.params.meetingId,
  });
  res.json(buildSuccessResponse(result));
});

module.exports = {
  createMeetingController,
  listMeetingsController,
  startMeetingController,
  getMeetingController,
  postMeetingMessageController,
  getMeetingInsightsController,
  finalizeMeetingController,
};
