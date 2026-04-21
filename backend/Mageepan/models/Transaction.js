const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'Transaction must belong to a user'] 
    },
    sessionId: { type: String, required: [true, 'Session ID is required'] },
    stripeSessionId: { type: String }, // Optional if paying via wallet
    paymentMethod: { type: String, enum: ['stripe', 'wallet', 'card'], default: 'stripe' },
    amount: { 
        type: Number, 
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    }, // Total amount paid in dollars/currency
    platformFee: { 
        type: Number, 
        default: 0
    },
    platformCommission: {
        type: Number,
        default: 0
    },
    tutorEarnings: { 
        type: Number, 
        required: [true, 'Tutor earnings are required'],
        min: [0, 'Earnings cannot be negative']
    }, // e.g., 80%
    tutorId: { type: String, required: [true, 'Tutor ID is required for commission tracking'] }, // ID of the tutor
    status: { 
        type: String, 
        enum: ['pending', 'held_in_escrow', 'released', 'disputed', 'refunded', 'failed'],
        default: 'pending' 
    },
    releaseDate: { type: Date }, // When money is released to tutor
    invoiceUrl: { type: String }, // Link to Stripe PDF invoice
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
