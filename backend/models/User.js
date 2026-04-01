const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['student', 'tutor'],
        default: 'student'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    stripeCustomerId: {
        type: String,
        default: null
    },
    paidSessions: {
        type: [String],
        default: []
    },
    subscriptionStatus: {
        type: String,
        enum: ['none', 'active', 'canceled'],
        default: 'none'
    },
    subscriptionTier: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
