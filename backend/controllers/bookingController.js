const Booking = require('../models/Booking');
const Session = require('../models/Session');
const Availability = require('../models/Availability');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const { session, notes } = req.body;
        const student = req.user.id; // From protect middleware

        // Check if already booked
        const existingBooking = await Booking.findOne({ session, student });
        if (existingBooking) {
            return res.status(400).json({ success: false, error: 'You have already booked this session' });
        }

        const booking = await Booking.create({
            session,
            student,
            notes
        });

        // Update Availability slot (if applicable, or just notify)
        // Note: Stripe flow normally handles this, but manual booking might need it
        await Availability.findOneAndUpdate(
            { _id: session }, // Assuming sessionId matches availabilityId for now or linked
            { $addToSet: { enrolledStudents: student } }
        );

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get current student bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getStudentBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ student: req.user.id })
            .populate('session')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, error: 'Booking not found' });
        }

        // Make sure user owns the booking
        if (booking.student.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Release the slot in Availability
        await Availability.findOneAndUpdate(
            { _id: booking.session },
            { $pull: { enrolledStudents: req.user.id } }
        );

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get session details (Protected Access)
// @route   GET /api/bookings/session/:sessionId
// @access  Private
exports.getSessionDetails = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const studentId = req.user.id;

        // Check if the student is enrolled in this session
        // We can check the Availability model's enrolledStudents array
        const availability = await Availability.findById(sessionId);

        if (!availability) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        if (!availability.enrolledStudents.includes(studentId)) {
            return res.status(403).json({ 
                success: false, 
                error: 'Access Denied: You must book this session to view meeting details' 
            });
        }

        // Mocking the sensitive data if a real Session model instance doesn't exist yet
        // In a real app, you'd do: const session = await Session.findById(...)
        const sessionDetails = {
            id: availability._id,
            startTime: availability.startTime,
            endTime: availability.endTime,
            meetingLink: 'https://zoom.us/j/mock_meeting_' + availability._id,
            password: 'STU_PASS_' + availability._id.toString().slice(-4).toUpperCase()
        };

        res.status(200).json({
            success: true,
            data: sessionDetails
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
