const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating'],
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['approved', 'hidden', 'flagged'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feedback', FeedbackSchema);