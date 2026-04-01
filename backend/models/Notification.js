const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['booking', 'cancellation', 'system'],
        default: 'booking'
    },
    relatedBooking: {
        type: mongoose.Schema.ObjectId,
        ref: 'Booking'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // 7 days
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
