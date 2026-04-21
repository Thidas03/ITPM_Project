const User = require('../../models/User');

exports.payWithWallet = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.walletBalance < amount) return res.status(400).json({ success: false, message: 'Insufficient balance' });

        user.walletBalance -= amount;
        await user.save();

        res.json({ success: true, message: 'Paid with wallet' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.processMockCardPayment = async (req, res) => {
    try {
        // Mock successful payment
        res.json({ success: true, message: 'Card payment successful' });
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
