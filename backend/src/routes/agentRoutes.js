const express = require("express");
const { postAgentMessage } = require("../controllers/agentController");

const router = express.Router();

router.post("/message", postAgentMessage);

module.exports = router;
