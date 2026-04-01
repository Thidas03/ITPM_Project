const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'Transaction must belong to a user'] 
    },
    sessionId: { type: String }, // For single sessions
    bundleId: { type: String },  // For bundles
    stripeSessionId: { type: String, required: [true, 'Stripe Session ID is required'] },
    amount: { 
        type: Number, 
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    }, // Total amount paid in dollars/currency
    platformFee: { 
        type: Number, 
        required: [true, 'Platform fee is required'],
        min: [0, 'Fee cannot be negative']
    }, // e.g., 20%
    tutorEarnings: { 
        type: Number, 
        required: [true, 'Tutor earnings are required'],
        min: [0, 'Earnings cannot be negative']
    }, // e.g., 80%
    tutorId: { type: String, required: [true, 'Tutor ID is required for commission tracking'] }, // ID of the tutor
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed' 
    },
    invoiceUrl: { type: String }, // Link to Stripe PDF invoice
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
