const { buildErrorResponse } = require("../services/responseService");
const logger = require("../services/logger");

function notFoundHandler(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = "ROUTE_NOT_FOUND";
  next(error);
}

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;

  logger.error({
    event: "request_failed",
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code: err.code || "INTERNAL_ERROR",
    message: err.message,
  });

  res.status(statusCode).json(buildErrorResponse(err));
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
