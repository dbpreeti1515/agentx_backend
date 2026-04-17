const { asyncHandler } = require("../middleware/asyncHandler");
const { buildSuccessResponse } = require("../services/responseService");
const { processCopilotMessage } = require("../services/copilotMessageService");

const postCopilotMessage = asyncHandler(async (req, res) => {
  const result = await processCopilotMessage(req.body || {});
  res.json(buildSuccessResponse(result));
});

module.exports = {
  postCopilotMessage,
};
