const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["system", "user", "assistant"],
      required: true,
      index: false,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 12000,
    },
    step: {
      type: String,
      default: null,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
      validate: {
        validator: Array.isArray,
        message: "messages must be an array",
      },
    },
    requirements: {
      projectSummary: { type: String, default: "" },
      objectives: { type: [String], default: [] },
      targetAudience: { type: [String], default: [] },
      deliverables: { type: [String], default: [] },
      timeline: { type: String, default: "" },
      budget: { type: String, default: "" },
      technicalConstraints: { type: [String], default: [] },
      successCriteria: { type: [String], default: [] },
      tonePreferences: { type: [String], default: [] },
      knownFacts: { type: [String], default: [] },
    },
    gaps: {
      missingRequirements: { type: [String], default: [] },
      missingInfo: { type: [String], default: [] },
      risks: { type: [String], default: [] },
      suggestions: { type: [String], default: [] },
      readinessScore: { type: Number, default: 0, min: 0, max: 100 },
      readyForProposal: { type: Boolean, default: false },
      budgetConflict: { type: Boolean, default: false },
      budgetConflictReason: { type: String, default: "" },
    },
    pendingQuestions: {
      type: [String],
      default: [],
    },
    proposal: {
      title: { type: String, default: "" },
      executiveSummary: { type: String, default: "" },
      scope: { type: [String], default: [] },
      deliverables: { type: [String], default: [] },
      timeline: { type: [String], default: [] },
      pricing: {
        model: { type: String, default: "" },
        details: { type: [String], default: [] },
      },
      assumptions: { type: [String], default: [] },
      nextSteps: { type: [String], default: [] },
      proposalText: { type: String, default: "" },
      revisionNotes: { type: [String], default: [] },
    },
    agentState: {
      status: { type: String, default: "idle" },
      currentStep: { type: String, default: null },
      lastDecision: { type: String, default: null },
      lastThought: { type: String, default: null },
      iterations: { type: Number, default: 0, min: 0, max: 5 },
      readyForProposal: { type: Boolean, default: false },
      confidence: { type: Number, default: 0, min: 0, max: 100 },
      stopReason: { type: String, default: null },
      lastError: { type: String, default: null },
    },
  },
  { timestamps: true }
);

sessionSchema.index({ updatedAt: -1 });
sessionSchema.index({ "agentState.status": 1, updatedAt: -1 });

module.exports =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);
