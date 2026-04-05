const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
    tutor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please specify a tutor ID']
    },
    dayOfWeek: {
        type: String,
        enum: {
            values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            message: 'Day of week must be a valid day (e.g., Monday)'
        },
        required: [true, 'Please select a day of the week']
    },
    startTime: {
        type: String,
        required: [true, 'Please add a start time'],
        match: [
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            'Please add a valid start time in HH:mm format'
        ]
    },
    endTime: {
        type: String,
        required: [true, 'Please add an end time'],
        match: [
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            'Please add a valid end time in HH:mm format'
        ]
    },
    maxStudents: {
        type: Number,
        default: 10,
        required: [true, 'Please specify maximum capacity']
    },
    enrolledStudents: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Availability', AvailabilitySchema);