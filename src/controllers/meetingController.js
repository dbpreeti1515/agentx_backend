const { asyncHandler } = require("../middleware/asyncHandler");
const { buildSuccessResponse } = require("../services/responseService");
const {
  createMeeting,
  getMeetingState,
  postMeetingMessage,
} = require("../services/meetingService");

const createMeetingController = asyncHandler(async (req, res) => {
  const result = await createMeeting(req.body || {});
  res.json(buildSuccessResponse(result));
});

const postMeetingMessageController = asyncHandler(async (req, res) => {
  const result = await postMeetingMessage(req.body || {});
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

module.exports = {
  createMeetingController,
  getMeetingController,
  postMeetingMessageController,
};
