const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      trim: true,
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      trim: true,
    },
    tutorId: {
      type: String,
      required: [true, "Tutor ID is required"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [5, "Comment must be at least 5 characters"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Resolved"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);