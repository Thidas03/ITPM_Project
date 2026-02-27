const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String }, // For single sessions
    bundleId: { type: String },  // For bundles
    stripeSessionId: { type: String, required: true },
    amount: { type: Number, required: true }, // Total amount paid in dollars/currency
    platformFee: { type: Number, required: true }, // e.g., 20%
    tutorEarnings: { type: Number, required: true }, // e.g., 80%
    tutorId: { type: String }, // ID of the tutor for commission tracking
    status: { type: String, default: 'completed' },
    invoiceUrl: { type: String }, // Link to Stripe PDF invoice
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
