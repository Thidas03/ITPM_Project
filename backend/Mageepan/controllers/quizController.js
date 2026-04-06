const Quiz = require('../models/Quiz');
const Discount = require('../models/Discount');
const User = require('../../models/User');

// CREATE QUIZ (Tutor)
exports.createQuiz = async (req, res) => {
    try {
        const { sessionId, tutorId, questions } = req.body;

        if (questions.length !== 10) {
            return res.status(400).json({ success: false, message: 'Exactly 10 questions are required' });
        }

        let quiz = await Quiz.findOne({ session: sessionId });
        if (quiz) {
            quiz.questions = questions;
            await quiz.save();
        } else {
            quiz = await Quiz.create({ session: sessionId, tutor: tutorId, questions });
        }

        res.status(201).json({ success: true, data: quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET QUIZ BY SESSION
exports.getQuizBySession = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ session: req.params.sessionId });
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'No quiz found for this session' });
        }
        res.json({ success: true, data: quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// SUBMIT QUIZ (Student)
exports.submitQuiz = async (req, res) => {
    try {
        const { sessionId, studentId, answers } = req.body; // answers is array of selected indices

        const quiz = await Quiz.findOne({ session: sessionId });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        let score = 0;
        quiz.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctOptionIndex) {
                score++;
            }
        });

        const discountPercentage = score * 0.01; // Each correct = 1%

        // Save Discount record (Tutor-Specific)
        if (discountPercentage > 0) {
            await Discount.create({
                student: studentId,
                tutor: quiz.tutor,
                percentage: discountPercentage,
                sourceSession: sessionId
            });
        }

        res.json({
            success: true,
            score,
            discountEarned: discountPercentage * 100,
            message: `You scored ${score}/10! You earned a ${score}% discount for your next session with this tutor.`
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ACTIVE DISCOUNT FOR TUTOR
exports.getActiveDiscount = async (req, res) => {
    try {
        const { studentId, tutorId } = req.query;
        const discount = await Discount.findOne({
            student: studentId,
            tutor: tutorId,
            isUsed: false
        });
        res.json({ success: true, data: discount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
