const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");

const {
  createFeedback,
  getAllFeedback,
  getTutorFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} = require("../controllers/feedbackController");

// Submit feedback (User role usually, or everyone)
router.post("/", createFeedback);

// Admin view (Protected)
router.get("/", protect, admin, getAllFeedback);

// Tutor view (Protected for specific tutor or admin)
router.get("/tutor/:tutorId", protect, getTutorFeedback);

// Update feedback status (Admin only)
router.put("/:id", protect, admin, updateFeedbackStatus);

// Delete feedback (Admin only)
router.delete("/:id", protect, admin, deleteFeedback);

module.exports = router;