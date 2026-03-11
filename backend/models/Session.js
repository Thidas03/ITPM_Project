const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    tutor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        expires: 86400 // 24 hours
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'booked', 'completed', 'cancelled'],
        default: 'available'
    },
    maxParticipants: {
        type: Number,
        default: 1
    },
    currentParticipants: {
        type: Number,
        default: 0
    },
    meetingLink: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Session', SessionSchema);
