const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    tutorName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
    category: {
      type: String,
      default: "General",
      enum: ["General", "Teaching Quality", "Communication", "Punctuality"],
    },
    status: {
      type: String,
      enum: ["approved", "hidden", "flagged"],
      default: "approved",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);