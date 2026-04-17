const express = require("express");
const {
  createMeetingController,
  getMeetingController,
  postMeetingMessageController,
} = require("../controllers/meetingController");

const router = express.Router();

router.post("/create", createMeetingController);
router.post("/message", postMeetingMessageController);
router.get("/:meetingId", getMeetingController);

module.exports = router;
