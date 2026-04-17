const mongoose = require("mongoose");
const logger = require("../services/logger");

let hasWarnedAboutMemoryFallback = false;

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    if (!hasWarnedAboutMemoryFallback) {
      logger.warn({
        event: "db_fallback_memory",
        message:
          "MONGODB_URI is not set. Falling back to in-memory sessions until a database is configured.",
      });
      hasWarnedAboutMemoryFallback = true;
    }

    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  logger.info({
    event: "db_connected",
    provider: "mongodb",
  });
  return true;
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  isMongoConnected,
};
