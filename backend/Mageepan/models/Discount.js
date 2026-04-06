const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
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
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 0.10 // Max 10%
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    sourceSession: {
        type: mongoose.Schema.ObjectId,
        ref: 'Session',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Discount', DiscountSchema);
