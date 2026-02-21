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
    notes: {
        type: String,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
