require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./src/db/connect");
const agentRoutes = require("./src/routes/agentRoutes");
const copilotRoutes = require("./src/routes/copilotRoutes");
const { errorHandler, notFoundHandler } = require("./src/middleware/errorHandler");
const logger = require("./src/services/logger");
const { initializeSocket } = require("./src/services/socketService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { ok: true, service: "agentx-backend" } });
});

app.use("/api/agent", agentRoutes);
app.use("/api/copilot", copilotRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

initializeSocket(io);

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  await connectDB();

  server.listen(PORT, () => {
    logger.info({
      event: "server_started",
      port: PORT,
      transport: "http+ws",
    });
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    logger.error({
      event: "server_start_failed",
      message: error.message,
    });
    process.exit(1);
  });
}

module.exports = { app, server, startServer };
