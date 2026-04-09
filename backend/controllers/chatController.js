const Message = require('../models/Message');
const Session = require('../models/Session');
const Booking = require('../models/Booking');

exports.getMessages = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        // Verify session exists
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        let isAuthorized = false;

        if (session.tutor.toString() === userId.toString()) {
            isAuthorized = true;
        } else {
            const booking = await Booking.findOne({ session: sessionId, student: userId });
            if (booking) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, error: 'Not authorized to view this chat' });
        }

        const messages = await Message.find({ sessionId })
            .populate('senderId', 'firstName lastName role')
            .sort({ timestamp: 1, createdAt: 1 });

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
