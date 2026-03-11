const Session = require('../models/Session');
const Booking = require('../models/Booking');

// CREATE SESSION
exports.createSession = async (req, res) => {
    try {
        const { tutor, date, startTime, endTime, maxParticipants, meetingLink } = req.body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session date'
            });
        }

        if (targetDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Session date cannot be in the past'
            });
        }

        const session = await Session.create({
            tutor,
            date,
            startTime,
            endTime,
            maxParticipants: maxParticipants || 1,
            meetingLink: meetingLink || ''
        });

        res.status(201).json({
            success: true,
            data: session
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// GET SESSIONS BY TUTOR
exports.getSessionsByTutor = async (req, res) => {
    try {
        const sessions = await Session.find({ tutor: req.params.tutorId }).sort({ date: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE SESSION
exports.deleteSession = async (req, res) => {
    try {
        const session = await Session.findByIdAndDelete(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        res.status(200).json({
            success: true,
            message: "Session deleted"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE SESSION
exports.updateSession = async (req, res) => {
    try {
        const { date, startTime, endTime, maxParticipants, meetingLink } = req.body;

        if (date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);

            if (isNaN(targetDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid session date'
                });
            }

            if (targetDate < today) {
                return res.status(400).json({
                    success: false,
                    message: 'Session date cannot be in the past'
                });
            }
        }

        const session = await Session.findByIdAndUpdate(
            req.params.sessionId,
            { date, startTime, endTime, maxParticipants, meetingLink },
            { new: true, runValidators: true }
        );

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        res.status(200).json({
            success: true,
            data: session
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// GET RECOMMENDED SLOT (Mock implementation for now to satisfy frontend)
exports.getRecommendedSlot = async (req, res) => {
    try {
        // Just return the earliest available session for now
        const session = await Session.findOne({
            tutor: req.params.tutorId,
            status: 'available',
            date: { $gte: new Date() }
        }).sort({ date: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            data: session || null
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// BOOK SESSION (student books a specific scheduled session)
exports.bookSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);

        if (sessionDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book a past session'
            });
        }

        if (session.status === 'cancelled' || session.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'This session is no longer bookable'
            });
        }

        if (session.currentParticipants >= session.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: 'This session is fully booked'
            });
        }

        session.currentParticipants += 1;
        if (session.currentParticipants >= session.maxParticipants) {
            session.status = 'booked';
        } else if (session.status === 'available') {
            // keep as available until full; you could introduce a 'partially_booked' state if desired
        }

        await session.save();

        res.status(200).json({
            success: true,
            data: session
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
// GET PARTICIPANTS FOR A SESSION
exports.getSessionParticipants = async (req, res) => {
    try {
        const bookings = await Booking.find({ session: req.params.sessionId })
            .populate('student', 'name email')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
