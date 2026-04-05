const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    tutor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    availability: {
        type: mongoose.Schema.ObjectId,
        ref: 'Availability',
        required: false
    },
    session: {
        type: mongoose.Schema.ObjectId,
        ref: 'Session',
        required: false
    },
    bookingDate: {
        type: Date,
        required: true,
        expires: 86400 // 24 hours
    },
    status: {
        type: String,
        enum: ['upcoming', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    attended: {
        type: Boolean,
        default: false
    },
    attendanceStatus: {
        type: String,
        enum: ['attended', 'missed', 'none'],
        default: 'none'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        maxlength: 500
    },
    notes: {
        type: String,
        maxlength: 500
    },
    meetingLink: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    sentReminders: [{ type: String }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
