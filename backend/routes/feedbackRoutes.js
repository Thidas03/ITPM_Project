const express = require('express');
const router = express.Router();

const {
  createFeedback,
  getFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} = require('../controllers/feedbackController');

router.post('/', createFeedback);
router.get('/:tutorId', getFeedback);
router.put('/:id/status', updateFeedbackStatus);
router.delete('/:id', deleteFeedback);

module.exports = router;