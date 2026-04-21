const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'Transaction must belong to a user'] 
    },
    transactionType: {
        type: String,
        enum: ['recharge', 'payment', 'payout', 'refund'],
        default: 'payment'
    },
    description: {
        type: String,
        default: 'Session Payment'
    },
    sessionId: { type: String }, // Optional for recharges
    stripeSessionId: { type: String }, 
    paymentMethod: { type: String, enum: ['stripe', 'wallet', 'card'], default: 'stripe' },
    amount: { 
        type: Number, 
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    }, 
    platformFee: { type: Number, default: 0 },
    platformCommission: { type: Number, default: 0 },
    tutorEarnings: { type: Number, default: 0 }, 
    tutorId: { type: String }, 
    status: { 
        type: String, 
        enum: ['pending', 'held_in_escrow', 'released', 'disputed', 'refunded', 'failed', 'completed'],
        default: 'completed' 
    },
    releaseDate: { type: Date }, 
    invoiceUrl: { type: String }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

