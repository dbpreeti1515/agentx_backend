const axios = require("axios");
const { AppError } = require("./errors");
const logger = require("./logger");
const { safeParseJson } = require("./jsonUtils");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const DEFAULT_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 45000);
const DEFAULT_RETRIES = Math.min(2, Math.max(0, Number(process.env.LLM_RETRIES || 2)));

async function callLLM(messages, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new AppError("GROQ_API_KEY is not configured", 500, "LLM_CONFIG_ERROR");
  }

  const payload = {
    model: options.model || DEFAULT_MODEL,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 1200,
  };

  if (options.responseFormat) {
    payload.response_format = options.responseFormat;
  }

  const maxRetries = Number.isInteger(options.maxRetries)
    ? options.maxRetries
    : DEFAULT_RETRIES;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await axios.post(GROQ_API_URL, payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      });

      const content = response.data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new AppError(
          "LLM response did not include any content",
          502,
          "LLM_EMPTY_RESPONSE"
        );
      }

      return content;
    } catch (error) {
      lastError = error;

      logger.warn({
        event: "llm_request_retry",
        attempt: attempt + 1,
        maxRetries,
        message:
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          error.message,
      });
    }
  }

  const apiMessage =
    lastError?.response?.data?.error?.message ||
    lastError?.response?.data?.message ||
    lastError?.message ||
    "Unknown LLM error";

  throw new AppError(
    `Groq API request failed: ${apiMessage}`,
    502,
    "LLM_REQUEST_FAILED"
  );
}

async function callStructuredLLM({
  prompt,
  validate,
  fallback,
  options = {},
  retries = 2,
}) {
  let lastRaw = "";
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      lastRaw = await callLLM([{ role: "user", content: prompt }], {
        ...options,
        responseFormat: { type: "json_object" },
      });
    } catch (error) {
      lastError = error;
      logger.warn({
        event: "llm_structured_call_failed",
        attempt: attempt + 1,
        retries,
        code: error.code || "LLM_REQUEST_FAILED",
        message: error.message,
      });
      continue;
    }

    const parsed = safeParseJson(lastRaw, null);

    if (parsed.ok && validate(parsed.data)) {
      return {
        data: parsed.data,
        raw: lastRaw,
        parsingSucceeded: true,
        attempts: attempt + 1,
      };
    }

    logger.warn({
      event: "llm_structured_validation_failed",
      attempt: attempt + 1,
      retries,
    });
  }

  return {
    data: typeof fallback === "function" ? fallback() : fallback,
    raw: lastRaw || lastError?.message || "",
    parsingSucceeded: false,
    attempts: retries + 1,
  };
}

module.exports = {
  callLLM,
  callStructuredLLM,
};
