const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getAllFeedback,
  getTutorFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} = require("../controllers/feedbackController");

// Submit feedback
router.post("/", createFeedback);

// Admin view
router.get("/", getAllFeedback);

// Tutor view
router.get("/tutor/:tutorId", getTutorFeedback);

// Update feedback status
router.put("/:id", updateFeedbackStatus);

// Delete feedback
router.delete("/:id", deleteFeedback);

module.exports = router;