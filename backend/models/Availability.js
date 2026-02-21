const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
    tutor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    startTime: {
        type: String,
        required: true // e.g., '09:00'
    },
    endTime: {
        type: String,
        required: true // e.g., '17:00'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Availability', AvailabilitySchema);
