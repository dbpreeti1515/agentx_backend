function buildSuccessResponse(data) {
  return {
    success: true,
    data,
  };
}

function buildErrorResponse(error) {
  return {
    success: false,
    error: {
      message: error.message || "Internal server error",
      code: error.code || "INTERNAL_ERROR",
      details: error.details || null,
    },
  };
}

module.exports = {
  buildSuccessResponse,
  buildErrorResponse,
};
