const express = require("express");
const {
  createMeetingController,
  listMeetingsController,
  startMeetingController,
  getMeetingController,
  postMeetingMessageController,
  getMeetingInsightsController,
  finalizeMeetingController,
} = require("../controllers/meetingController");

const router = express.Router();

router.post("/create", createMeetingController);
router.get("/list", listMeetingsController);
router.post("/message", postMeetingMessageController);
router.post("/:meetingId/start", startMeetingController);
router.get("/:meetingId/insights", getMeetingInsightsController);
router.post("/:meetingId/finalize", finalizeMeetingController);
router.get("/:meetingId", getMeetingController);

module.exports = router;
