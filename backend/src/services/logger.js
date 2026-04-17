const SERVICE_NAME = process.env.SERVICE_NAME || "agentx-backend";

function write(level, payload) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE_NAME,
    ...payload,
  };

  const serialized = `${JSON.stringify(entry)}\n`;

  if (level === "error" || level === "warn") {
    process.stderr.write(serialized);
    return;
  }

  process.stdout.write(serialized);
}

function info(payload) {
  write("info", payload);
}

function warn(payload) {
  write("warn", payload);
}

function error(payload) {
  write("error", payload);
}

function debug(payload) {
  if (String(process.env.LOG_LEVEL || "info").toLowerCase() === "debug") {
    write("debug", payload);
  }
}

module.exports = {
  info,
  warn,
  error,
  debug,
};
