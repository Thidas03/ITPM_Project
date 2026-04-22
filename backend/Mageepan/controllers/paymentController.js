const User = require('../../models/User');
const Transaction = require('../models/Transaction');
const { sendPayoutConfirmation } = require('../../services/emailService');



exports.payWithWallet = async (req, res) => {
    try {
        const { userId, amount, description, sessionId, availabilityId } = req.body;
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.walletBalance < amount) return res.status(400).json({ success: false, message: 'Insufficient balance' });

        // Deduct from student
        user.walletBalance -= amount;
        await user.save();

        const platformCommission = amount * 0.1;
        const tutorEarnings = amount * 0.9;

        let finalTutorId = req.body.tutorId || 'N/A';
        
        // Try to get tutor from Availability
        const Availability = require('../../models/Availability');
        if (availabilityId) {
            const availability = await Availability.findById(availabilityId);
            if (availability) {
                finalTutorId = availability.tutor;
                
                // Also add student to availability
                availability.enrolledStudents.push(userId);
                await availability.save();
            }
        }

        // Create transaction record for student
        await Transaction.create({
            userId,
            amount: amount,
            transactionType: 'payment',
            description: description || 'Session Booking (Wallet)',
            sessionId: sessionId || 'N/A',
            tutorId: finalTutorId,
            paymentMethod: 'wallet',
            platformCommission,
            tutorEarnings,
            status: 'completed'
        });

        // Credit the Tutor
        if (finalTutorId !== 'N/A') {
            await User.findByIdAndUpdate(finalTutorId, {
                $inc: { walletBalance: tutorEarnings }
            });
            console.log(`Tutor ${finalTutorId} credited with Rs ${tutorEarnings} from Wallet Payment`);
        }

        res.json({ success: true, message: 'Paid with wallet, tutor credited' });
    } catch (error) {
        console.error('Wallet Payment Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.processMockCardPayment = async (req, res) => {
    try {
        const { expiryDate, userId, amount, description, sessionId, availabilityId } = req.body; 

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

        const platformCommission = parseFloat(amount) * 0.1;
        const tutorEarnings = parseFloat(amount) * 0.9;
        let finalTutorId = req.body.tutorId || 'N/A';

        // Try to get tutor from Availability
        const Availability = require('../../models/Availability');
        if (availabilityId) {
            const availability = await Availability.findById(availabilityId);
            if (availability) {
                finalTutorId = availability.tutor;
                
                // Also add student to availability
                availability.enrolledStudents.push(userId);
                await availability.save();
            }
        }

        if (userId && amount) {
            await Transaction.create({
                userId,
                amount: parseFloat(amount),
                transactionType: 'payment',
                description: description || 'Session Booking (Card)',
                sessionId: sessionId || 'N/A',
                tutorId: finalTutorId,
                paymentMethod: 'card',
                platformCommission,
                tutorEarnings,
                status: 'completed'
            });

            // Credit the Tutor
            if (finalTutorId !== 'N/A' && finalTutorId) {
                await User.findByIdAndUpdate(finalTutorId, {
                    $inc: { walletBalance: tutorEarnings }
                });
                console.log(`Tutor ${finalTutorId} credited with Rs ${tutorEarnings} from Mock Card Payment`);
            }
        }

        res.json({ success: true, message: 'Card payment successful, tutor credited' });

    } catch (error) {
        console.error('Mock Card Payment Error:', error);
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


exports.requestPayout = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const amountRequested = user.walletBalance || 0;

        if (amountRequested <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No earnings available for payout' 
            });
        }

        // Reset balance to 0
        user.walletBalance = 0;
        await user.save();

        // Create transaction record
        const transaction = await Transaction.create({
            userId: user._id,
            amount: amountRequested,
            transactionType: 'payout',
            description: 'Earning Payout Request',
            paymentMethod: 'wallet', // Recorded as wallet deduction
            status: 'completed' // Mocked as completed as requested
        });

        // Send email confirmation
        try {
            await sendPayoutConfirmation(user.email, {
                amount: amountRequested,
                transactionId: transaction._id,
                date: new Date().toLocaleDateString('en-GB')
            });
        } catch (emailErr) {
            console.error('Failed to send payout email:', emailErr);
            // We don't fail the request if email fails, but it's logged
        }

        res.json({ 
            success: true, 
            message: 'Payout request processed and email sent', 
            amount: amountRequested,
            transactionId: transaction._id
        });

    } catch (error) {
        console.error('Payout Request Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

