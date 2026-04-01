const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.ObjectId,
        ref: 'Session',
        required: true
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed'],
        default: 'confirmed'
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    sentReminders: [{ type: String }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
