const Transaction = require('../models/Transaction');
const User = require('../../models/User');
const Session = require('../../models/Session');
const Booking = require('../../models/Booking');
const Discount = require('../models/Discount');

exports.payWithWallet = async (req, res) => {
    const { userId, sessionId, availabilityId, amount, tutorId } = req.body;

    try {
        const user = await User.findById(userId);
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // 1. Check for Expiration
        const sessionDate = new Date(session.date);
        const [hours, minutes] = session.endTime.split(':');
        sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (new Date() > sessionDate) {
            return res.status(400).json({ message: 'This session has already ended' });
        }

        // 2. Check Capacity
        if (session.currentParticipants >= session.maxParticipants) {
            return res.status(400).json({ message: 'This session is already full' });
        }

        // 3. Discount Logic
        const discount = await Discount.findOne({ student: userId, tutor: session.tutor, isUsed: false });
        let discountPercentage = 0;
        if (discount) {
            discountPercentage = discount.percentage;
        }

        const finalAmount = amount * (1 - discountPercentage);

        if (user.walletBalance < finalAmount) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // 4. Process Payment
        user.walletBalance -= finalAmount;
        await user.save();

        if (discount) {
            discount.isUsed = true;
            await discount.save();
        }

        // 5. Register student in Session & Create Booking
        session.currentParticipants += 1;
        if (session.currentParticipants >= session.maxParticipants) {
            session.status = 'booked';
        }
        await session.save();

        const booking = new Booking({
            student: userId,
            tutor: session.tutor,
            session: sessionId,
            bookingDate: session.date,
            meetingLink: session.meetingLink || 'https://zoom.us/j/mock_meeting_id',
            status: 'upcoming'
        });
        await booking.save();

        try {
            const studentUser = await User.findById(userId);
            const studentName = studentUser ? studentUser.firstName : 'Unknown';
            const Notification = require('../../models/Notification');
            await Notification.create({
                recipient: session.tutor,
                message: `${studentName} has booked your scheduled session for ${new Date(session.date).toDateString()}.`,
                relatedBooking: booking._id,
                type: 'booking'
            });
        } catch (notifErr) { console.error('Notification Error:', notifErr); }

        // 6. Record Transaction
        const platformCommission = finalAmount * 0.10;
        const tutorEarnings = finalAmount * 0.90;

        const transaction = new Transaction({
            userId,
            sessionId,
            paymentMethod: 'wallet',
            amount: finalAmount,
            platformCommission,
            tutorEarnings,
            tutorId: session.tutor,
            status: 'held_in_escrow'
        });

        await transaction.save();

        res.json({ 
            success: true, 
            message: `Session booked successfully! ${discountPercentage > 0 ? `Applied ${discountPercentage * 100}% discount.` : ''}` 
        });
    } catch (error) {
        console.error('Wallet Payment Error:', error);
        res.status(500).json({ message: error.message || 'Internal server error during wallet payment' });
    }
};

exports.releaseFunds = async (req, res) => {
    const { transactionId } = req.params;

    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction || transaction.status !== 'held_in_escrow') {
            return res.status(400).json({ message: 'Invalid transaction status' });
        }

        // Update transaction status
        transaction.status = 'released';
        transaction.releaseDate = new Date();
        await transaction.save();

        // Add earnings to tutor's pending/wallet balance
        // In a real app, 'pendingBalance' might be used for bank transfers
        await User.findByIdAndUpdate(transaction.tutorId, {
            $inc: { walletBalance: transaction.tutorEarnings }
        });

        res.json({ success: true, message: 'Funds released to tutor' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.disputeTransaction = async (req, res) => {
    const { transactionId } = req.params;

    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        transaction.status = 'disputed';
        await transaction.save();

        res.json({ success: true, message: 'Transaction flagged for dispute. Admin will review.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getWalletBalance = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.json({ balance: user.walletBalance, pending: user.pendingBalance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTransactionBySessionId = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const transaction = await Transaction.findOne({ sessionId });
        res.json({ transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// BUY EXTRA SESSION SLOT
exports.buyExtraSlot = async (req, res) => {
    const { userId } = req.body;
    const price = 100; // Rs. 100 per extra slot

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.walletBalance < price) {
            return res.status(400).json({ message: `Insufficient balance. Each extra slot costs Rs. ${price}` });
        }

        // Deduct from wallet and add slot
        user.walletBalance -= price;
        user.extraSlots += 1;
        await user.save();

        // Record Transaction
        const transaction = new Transaction({
            userId,
            paymentMethod: 'wallet',
            amount: price,
            status: 'completed',
            description: 'Extra Session Slot Purchase'
        });
        await transaction.save();

        res.json({ 
            success: true, 
            message: 'Extra slot purchased successfully!',
            extraSlots: user.extraSlots,
            newBalance: user.walletBalance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.processMockCardPayment = async (req, res) => {
    const { userId, sessionId, availabilityId, amount, tutorId } = req.body;

    try {
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // 1. Check for Expiration
        const sessionDate = new Date(session.date);
        const [hours, minutes] = session.endTime.split(':');
        sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (new Date() > sessionDate) {
            return res.status(400).json({ message: 'This session has already ended' });
        }

        // 2. Check Capacity
        if (session.currentParticipants >= session.maxParticipants) {
            return res.status(400).json({ message: 'This session is already full' });
        }

        // 3. Register student & Create Booking
        session.currentParticipants += 1;
        if (session.currentParticipants >= session.maxParticipants) {
            session.status = 'booked';
        }
        await session.save();

        const booking = new Booking({
            student: userId,
            tutor: session.tutor,
            session: sessionId,
            bookingDate: session.date,
            meetingLink: session.meetingLink || 'https://zoom.us/j/mock_meeting_id',
            status: 'upcoming'
        });
        await booking.save();

        try {
            const studentUser = await User.findById(userId);
            const studentName = studentUser ? studentUser.firstName : 'Unknown';
            const Notification = require('../../models/Notification');
            await Notification.create({
                recipient: session.tutor,
                message: `${studentName} has booked your scheduled session for ${new Date(session.date).toDateString()}.`,
                relatedBooking: booking._id,
                type: 'booking'
            });
        } catch (notifErr) { console.error('Notification Error:', notifErr); }

        const transaction = new Transaction({
            userId,
            sessionId,
            paymentMethod: 'card',
            amount: amount,
            platformCommission: amount * 0.10,
            tutorEarnings: amount * 0.90,
            tutorId: session.tutor,
            status: 'held_in_escrow',
            description: 'Mock Card Payment (Simulated)'
        });
        await transaction.save();

        res.json({ success: true, message: 'Mock payment successful! Session booked.' });
    } catch (error) {
        console.error('Mock Card Payment Error:', error);
        res.status(500).json({ message: error.message || 'Internal server error during mock payment' });
    }
};
