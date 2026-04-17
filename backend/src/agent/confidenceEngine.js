function scoreField(value) {
  if (Array.isArray(value)) {
    return value.length ? 1 : 0;
  }

  if (typeof value === "string") {
    return value.trim() ? 1 : 0;
  }

  return value ? 1 : 0;
}

function calculateConfidence(requirements = {}, gaps = {}) {
  const weightedFields = [
    ["projectSummary", 18],
    ["objectives", 16],
    ["deliverables", 16],
    ["timeline", 14],
    ["budget", 12],
    ["targetAudience", 10],
    ["technicalConstraints", 7],
    ["successCriteria", 7],
  ];

  const baseScore = weightedFields.reduce((total, [field, weight]) => {
    return total + scoreField(requirements[field]) * weight;
  }, 0);

  const riskPenalty = Math.min((gaps.risks?.length || 0) * 4, 12);
  const missingPenalty = Math.min((gaps.missingInfo?.length || 0) * 5, 25);
  const readinessBoost = gaps.readyForProposal ? 6 : 0;

  return Math.max(
    0,
    Math.min(100, Math.round(baseScore - riskPenalty - missingPenalty + readinessBoost))
  );
}

module.exports = {
  calculateConfidence,
};
