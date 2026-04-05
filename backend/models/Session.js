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
    type: {
        type: String,
        enum: ['individual', 'group'],
        default: 'individual'
    },
    status: {
        type: String,
        enum: ['available', 'booked', 'completed', 'cancelled'],
        default: 'available'
    },
    password: {
        type: String,
        default: 'SECRET_PASS_123'
    },
    meetingLink: {
        type: String,
        default: 'https://zoom.us/j/mock_meeting_id'
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
