const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.ObjectId,
        ref: 'Session',
        required: true,
        unique: true
    },
    tutor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    questions: {
        type: [{
            questionText: { type: String, required: true },
            options: { type: [String], required: true, validate: [v => v.length === 4, 'Must have exactly 4 options'] },
            correctOptionIndex: { type: Number, required: true, min: 0, max: 3 }
        }],
        validate: [v => v.length === 10, 'Must have exactly 10 questions']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quiz', QuizSchema);
