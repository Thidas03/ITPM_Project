const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Tutor: Create/Fetch Quiz
router.post('/create', quizController.createQuiz);
router.get('/session/:sessionId', quizController.getQuizBySession);
router.get('/discount', quizController.getActiveDiscount);

// Student: Submit Quiz
router.post('/submit', quizController.submitQuiz);

module.exports = router;
