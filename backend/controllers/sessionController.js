const Session = require('../models/Session');

// CREATE SESSION
exports.createSession = async (req, res) => {
    try {
        const { tutor, date, startTime, endTime, maxParticipants } = req.body;

        const session = await Session.create({
            tutor,
            date,
            startTime,
            endTime,
            maxParticipants: maxParticipants || 1
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
        const { date, startTime, endTime, maxParticipants } = req.body;

        const session = await Session.findByIdAndUpdate(
            req.params.sessionId,
            { date, startTime, endTime, maxParticipants },
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
