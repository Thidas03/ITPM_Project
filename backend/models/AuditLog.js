const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'User Created',
            'Tutor Approved',
            'Role Updated',
            'User Deleted',
            'Session Managed',
            'System Config Changed'
        ]
    },
    target: {
        type: String, // E.g., Email of the user or ID of the session
        required: true
    },
    details: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
