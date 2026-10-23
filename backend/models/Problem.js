const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    problemId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Problem title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Electrical",
        "Plumbing",
        "Cleaning",
        "Infrastructure",
        "Equipment",
        "Internet/Networking",
        "Other",
      ],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [150, "Location cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    evidenceImageUrl: {
      type: String,
      default: null,
    },
    evidenceImagePublicId: {
      type: String,
      default: null,
    },
    resolutionImageUrl: {
      type: String,
      default: null,
    },
    resolutionImagePublicId: {
      type: String,
      default: null,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Resolved"],
      default: "Pending",
      index: true,
    },
    assignedPersonName: {
      type: String,
      default: null,
      trim: true,
    },
    assignedPersonPhone: {
      type: String,
      default: null,
      trim: true,
    },
    statusTokenHash: {
      type: String,
      default: null,
      select: false, // Hidden from normal API queries for security
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;
