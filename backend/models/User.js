const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    role: {
        type: String,
        enum: ['Student', 'Host', 'Admin'],
        default: 'Student'
    },
    // Dynamic RBAC Fields
    trustScore: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    },
    attendedSessions: {
        type: Number,
        default: 0
    },
    missedSessions: {
        type: Number,
        default: 0
    },
    cancellations: {
        type: Number,
        default: 0
    },
    misconductCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 5.0
    },
    tutorRequestStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    blockedUntil: {
        type: Date,
        default: null
    },
    badges: [String],
    profilePicture: {
        type: String,
        default: null
    },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
    },
    // Account Security fields
    isVerified: {
        type: Boolean,
        default: false
    },
    is2FAEnabled: {
        type: Boolean,
        default: false
    },
    otpSecret: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Dynamic RBAC Logic: Get Trust Level
userSchema.methods.getTrustLevel = function () {
    if (this.isBlocked && this.blockedUntil > new Date()) return 'Blocked';

    const totalBooked = this.attendedSessions + this.missedSessions;
    const attendanceRate = totalBooked === 0 ? 100 : (this.attendedSessions / totalBooked) * 100;

    if (attendanceRate >= 95 && this.cancellations === 0) return 'High';
    if (this.missedSessions >= 4 || this.cancellations > 5) return 'Low';
    return 'Medium';
};

// Get Booking Limit based on Trust Level
userSchema.methods.getBookingLimit = function () {
    const level = this.getTrustLevel();
    switch (level) {
        case 'High': return 5;
        case 'Medium': return 2;
        case 'Low': return 1;
        case 'Blocked': return 0;
        default: return 2;
    }
};

// Get Badges based on performance
userSchema.methods.calculateBadges = function () {
    const level = this.getTrustLevel();
    let currentBadges = [...this.badges];

    if (level === 'High' && !currentBadges.includes('Reliable Learner')) {
        currentBadges.push('Reliable Learner');
    } else if (level !== 'High') {
        currentBadges = currentBadges.filter(b => b !== 'Reliable Learner');
    }

    return currentBadges;
};

// Calculate a Trust Percentage (0-100)
userSchema.methods.getTrustPercentage = function () {
    const totalBooked = this.attendedSessions + this.missedSessions;
    const attendanceRate = totalBooked === 0 ? 100 : (this.attendedSessions / totalBooked) * 100;

    // Simple penalty factor for cancellations
    const cancellationPenalty = Math.min(this.cancellations * 5, 40);

    return Math.max(0, Math.round(attendanceRate - cancellationPenalty));
};

const User = mongoose.model('User', userSchema);

module.exports = User;
