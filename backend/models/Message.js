const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Session',
        required: true
    },
    senderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['student', 'tutor'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);
