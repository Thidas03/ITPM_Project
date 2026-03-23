const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getAllFeedback,
  getFeedbackByTutor,
  updateFeedbackStatus,
  deleteFeedback,
} = require("../controllers/feedbackController");

router.post("/", createFeedback);
router.get("/", getAllFeedback);
router.get("/tutor/:tutorId", getFeedbackByTutor);
router.put("/:id", updateFeedbackStatus);
router.delete("/:id", deleteFeedback);

module.exports = router;