const mongoose = require("mongoose");

const meetingMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["sales", "client", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 12000,
    },
    metadata: {
      senderName: { type: String, default: "" },
      visibility: { type: String, default: "shared" },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const participantSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["sales", "client"],
      required: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const meetingSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
    messages: {
      type: [meetingMessageSchema],
      default: [],
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
    proposalDraft: {
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
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    copilot: {
      thought: { type: String, default: "" },
      action: { type: String, default: "idle" },
      suggestion: { type: String, default: "" },
      risks: { type: [String], default: [] },
      missingInfo: { type: [String], default: [] },
      confidence: { type: Number, default: 0, min: 0, max: 100 },
    },
    meetingType: {
      type: String,
      enum: ["instant", "scheduled"],
      default: "instant",
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "completed"],
      default: "active",
      index: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    clientName: {
      type: String,
      default: "",
      trim: true,
    },
    agenda: {
      type: String,
      default: "",
      trim: true,
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: 10,
      max: 240,
    },
    scheduledAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

meetingSchema.index({ updatedAt: -1 });
meetingSchema.index({ status: 1, scheduledAt: 1, updatedAt: -1 });

module.exports =
  mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);
