const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    percentage: {
        type: Number,
        required: true,
        default: 0.1 // 10% discount
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    validUntil: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Discount', discountSchema);
