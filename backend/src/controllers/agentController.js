const { asyncHandler } = require("../middleware/asyncHandler");
const { buildSuccessResponse } = require("../services/responseService");
const { processAgentMessage } = require("../services/agentMessageService");

const postAgentMessage = asyncHandler(async (req, res) => {
  const result = await processAgentMessage(req.body || {});
  res.json(buildSuccessResponse(result));
});

module.exports = {
  postAgentMessage,
};
