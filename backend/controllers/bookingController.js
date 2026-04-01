const Booking = require('../models/Booking');
const Session = require('../models/Session');
const User = require('../models/User');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private/Middle (Student)
exports.createBooking = async (req, res) => {
    try {
        const { session, notes } = req.body;
        const studentId = req.user.id; // From authMiddleware

        // Check if session exists and is available
        const sessionDoc = await Session.findById(session);
        if (!sessionDoc) return res.status(404).json({ message: 'Session not found' });
        if (sessionDoc.status !== 'available') return res.status(400).json({ message: 'Session is no longer available' });

        // Check if student already booked this session
        const existingBooking = await Booking.findOne({ session, student: studentId });
        if (existingBooking) return res.status(400).json({ message: 'You have already booked this session' });

        const booking = await Booking.create({
            session,
            student: studentId,
            notes,
            status: 'confirmed'
        });

        // Optional: mark session as booked (if only one student can book)
        // sessionDoc.status = 'booked';
        // await sessionDoc.save();

        res.status(201).json({ success: true, booking });
        
        // Notify student of new booking
        const user = await User.findById(studentId);
        if (user && user.notificationPreferences?.onCreation) {
            const Notification = require('../models/Notification');
            await Notification.create({
                user: studentId,
                title: 'New Booking Confirmed',
                message: `You've successfully booked "${sessionDoc.title}". Check your dashboard for details.`,
                type: 'info'
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current student's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getStudentBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ student: req.user.id })
            .populate({
                path: 'session',
                populate: { path: 'tutor', select: 'firstName lastName email identityNumber' }
            })
            .sort('-createdAt');

        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, student: req.user.id });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status !== 'confirmed') return res.status(400).json({ message: 'Cannot cancel a session that is already completed or cancelled' });

        booking.status = 'cancelled';
        await booking.save();

        // penalty for cancellation could be added here if needed for trust score
        const user = await User.findById(req.user.id);
        user.cancellations += 1;
        await user.save();

        res.json({ success: true, message: 'Booking cancelled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Complete booking (Join/Mark as attended)
// @route   PUT /api/bookings/:id/complete
// @access  Private
exports.completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, student: req.user.id })
            .populate('session');
            
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status === 'completed') return res.status(400).json({ message: 'Session already completed' });

        booking.status = 'completed';
        booking.attended = true;
        booking.attendanceStatus = 'attended';
        await booking.save();

        // Update User stats
        const user = await User.findById(req.user.id);
        user.attendedSessions += 1;
        await user.save();

        res.json({ success: true, message: 'Session marked as attended' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Rate session
// @route   PUT /api/bookings/:id/rate
// @access  Private
exports.rateBooking = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const booking = await Booking.findOne({ _id: req.params.id, student: req.user.id });
        
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status !== 'completed') return res.status(400).json({ message: 'You can only rate a completed session' });

        booking.rating = rating;
        booking.review = review;
        await booking.save();

        res.json({ success: true, message: 'Rating submitted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
