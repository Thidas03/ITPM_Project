const User = require('../../models/User');
const Transaction = require('../models/Transaction');



exports.payWithWallet = async (req, res) => {
    try {
        const { userId, amount, description, sessionId } = req.body;
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.walletBalance < amount) return res.status(400).json({ success: false, message: 'Insufficient balance' });

        user.walletBalance -= amount;
        await user.save();

        // Create transaction record
        await Transaction.create({
            userId,
            amount: amount, // Positive amount
            transactionType: 'payment',
            description: description || 'Session Booking (Wallet)',
            sessionId: sessionId || 'N/A',
            tutorId: tutorId || 'N/A',
            paymentMethod: 'wallet',
            status: 'completed'
        });


        res.json({ success: true, message: 'Paid with wallet' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.processMockCardPayment = async (req, res) => {
    try {
        const { expiryDate } = req.body; 

        if (expiryDate) {
            const [monthStr, yearStr] = expiryDate.split('/');
            
            if (monthStr && yearStr) {
                const expMonth = parseInt(monthStr, 10);
                let expYear = parseInt(yearStr, 10);
                
                if (expYear < 100) {
                    expYear += 2000;
                }

                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentMonth = currentDate.getMonth() + 1;

                if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Payment Failed: The card's expiry date has passed." 
                    });
                }
            }
        }

        res.json({ success: true, message: 'Card payment successful' });
        
        const { userId, amount, description, sessionId } = req.body;
        if (userId && amount) {
            await Transaction.create({
                userId,
                amount: parseFloat(amount),
                transactionType: 'payment',
                description: description || 'Session Booking (Card)',
                sessionId: sessionId || 'N/A',
                tutorId: tutorId || 'N/A',
                paymentMethod: 'card',
                status: 'completed'
            });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.getWalletBalance = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.json({ success: true, balance: user.walletBalance || 0, pending: 0 });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.buyExtraSlot = async (req, res) => {
    try {
        res.json({ success: true, message: 'Extra slot purchased' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.releaseFunds = async (req, res) => {
    res.json({ success: true });
};

exports.disputeTransaction = async (req, res) => {
    res.json({ success: true });
};

exports.getTransactionBySessionId = async (req, res) => {
    res.json({ success: true, transaction: null });
};

exports.mockRechargeWallet = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        
        if (!userId || !amount) {
            return res.status(400).json({ success: false, message: 'Missing user ID or amount' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.walletBalance = (user.walletBalance || 0) + parseFloat(amount);
        await user.save();

        // Create transaction record
        await Transaction.create({
            userId: user._id,
            amount: parseFloat(amount),
            transactionType: 'recharge',
            description: 'Wallet Recharge (Mock)',
            paymentMethod: 'card',
            status: 'completed'
        });


        res.json({ 
            success: true, 
            message: 'Wallet recharge successful', 
            newBalance: user.walletBalance 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




exports.getTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

