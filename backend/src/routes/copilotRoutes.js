const express = require("express");
const { postCopilotMessage } = require("../controllers/copilotController");

const router = express.Router();

router.post("/message", postCopilotMessage);

module.exports = router;
