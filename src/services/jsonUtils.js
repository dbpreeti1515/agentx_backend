function extractJsonCandidate(rawText) {
  if (typeof rawText !== "string") {
    return "";
  }

  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return rawText.slice(firstBrace, lastBrace + 1);
  }

  return rawText.trim();
}

function safeParseJson(rawText, fallbackValue) {
  const candidate = extractJsonCandidate(rawText);

  try {
    return {
      data: JSON.parse(candidate),
      ok: true,
      raw: rawText,
    };
  } catch (error) {
    return {
      data: fallbackValue,
      ok: false,
      raw: rawText,
      error,
    };
  }
}

function ensureArrayOfStrings(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function ensureString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function ensureInteger(value, { min = 0, max = 100, fallback = 0 } = {}) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function validateKeys(payload, requiredKeys = []) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }

  return requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(payload, key));
}

module.exports = {
  ensureArrayOfStrings,
  ensureInteger,
  ensureString,
  extractJsonCandidate,
  safeParseJson,
  validateKeys,
};
