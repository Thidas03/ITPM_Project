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
    meetingLink: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
