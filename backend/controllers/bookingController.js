const Booking = require('../models/Booking');
const Availability = require('../models/Availability');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const User = require('../models/User');

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const normalizeDate = (value) => {
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return d;
};

// CREATE BOOKING
exports.createBooking = async (req, res) => {
    try {
        console.log('--- [START] createBooking ---');
        console.log('Payload:', JSON.stringify(req.body));
        const { student, availability: availabilityId, bookingDate } = req.body;

        if (!student || !availabilityId || !bookingDate) {
            console.warn('Missing fields');
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        const bookingDay = normalizeDate(bookingDate);
        if (isNaN(bookingDay.getTime())) {
            console.error('Invalid date string:', bookingDate);
            return res.status(400).json({ success: false, message: 'Invalid date' });
        }

        const today = normalizeDate(new Date());
        if (bookingDay < today) {
            console.warn('Attempt to book past date:', bookingDay);
            return res.status(400).json({ success: false, message: 'Cannot book past date' });
        }

        const availability = await Availability.findById(availabilityId);
        if (!availability) {
            console.error('Availability not found ID:', availabilityId);
            return res.status(404).json({ success: false, message: 'Availability not found' });
        }
        console.log('Found Availability:', availability.dayOfWeek, availability.startTime);

        const weekdayName = dayNames[bookingDay.getDay()];
        if (weekdayName !== availability.dayOfWeek) {
            console.warn('Weekday mismatch. Slot is:', availability.dayOfWeek, 'but requested date is:', weekdayName);
            return res.status(400).json({ success: false, message: `Must be a ${availability.dayOfWeek}` });
        }

        const conflict = await Booking.findOne({
            availability: availabilityId,
            bookingDate: bookingDay,
            status: { $in: ['upcoming'] }
        });
        if (conflict) {
            console.warn('Conflict found with booking ID:', conflict._id);
            return res.status(400).json({ success: false, message: 'Already booked' });
        }

        const meetingLink = `https://meet.jit.si/STUEDU-${Math.random().toString(36).substring(2, 12)}`;
        console.log('Creating Booking Record...');
        const booking = await Booking.create({
            student,
            tutor: availability.tutor,
            availability: availability._id,
            bookingDate: bookingDay,
            meetingLink
        });
        console.log('Booking Saved ID:', booking._id);

        try {
            console.log('Fetching Student Info for Notification...');
            const studentUser = await User.findById(student);
            const studentName = studentUser ? studentUser.name : 'Unknown Student';
            console.log('Student Name:', studentName);

            console.log('Creating Notification for Tutor:', availability.tutor);
            await Notification.create({
                recipient: availability.tutor,
                message: `${studentName} booked your session for ${bookingDay.toDateString()} at ${availability.startTime}`,
                relatedBooking: booking._id,
                type: 'booking'
            });
            console.log('Notification Success');
        } catch (notifErr) {
            console.error('NOTIFICATION ERROR (NON-BLOCKING):', notifErr.message);
        }

        console.log('--- [SUCCESS] createBooking ---');
        res.status(201).json({ success: true, data: booking });
    } catch (err) {
        console.error('CRITICAL createBooking ERROR:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// CREATE BOOKING FOR A SCHEDULED SESSION
exports.createSessionBooking = async (req, res) => {
    try {
        console.log('--- CREATE SESSION BOOKING ATTEMPT ---');
        console.log('Request Body:', req.body);
        const { student, session: sessionId } = req.body;

        if (!student || !sessionId) {
            return res.status(400).json({
                success: false,
                message: 'student and session are required'
            });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const today = normalizeDate(new Date());
        const sessionDay = normalizeDate(session.date);
        if (sessionDay < today) {
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

        // Prevent same student booking the same session twice
        const existing = await Booking.findOne({
            student,
            session: sessionId,
            status: { $in: ['upcoming'] }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You have already booked this session'
            });
        }

        // Create booking record
        const meetingLink = `https://meet.jit.si/STUEDU-${Math.random().toString(36).substring(2, 12)}`;
        const booking = await Booking.create({
            student,
            tutor: session.tutor,
            session: session._id,
            bookingDate: sessionDay,
            meetingLink
        });

        console.log('Session Booking Created Successfully:', booking._id);

        // Separate try/catch for notification
        try {
            // Get student name for notification
            const studentUser = await User.findById(student);
            const studentName = studentUser ? studentUser.name : 'A student';

            // Create notification for tutor
            await Notification.create({
                recipient: session.tutor,
                message: `${studentName} joined your scheduled session for ${sessionDay.toLocaleDateString()} at ${session.startTime}`,
                relatedBooking: booking._id,
                type: 'booking'
            });
            console.log('Notification Created for Tutor:', session.tutor);
        } catch (notificationError) {
            console.error('FAILED TO CREATE NOTIFICATION:', notificationError.message);
        }

        // Update session participation
        session.currentParticipants += 1;
        if (session.currentParticipants >= session.maxParticipants) {
            session.status = 'booked';
        }
        await session.save();

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET BOOKINGS BY STUDENT
exports.getBookingsByStudent = async (req, res) => {
    try {
        const bookings = await Booking.find({ student: req.params.studentId })
            .populate('tutor', 'name email')
            .populate('availability')
            .populate('session')
            .sort({ bookingDate: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET BOOKINGS BY TUTOR
exports.getBookingsByTutor = async (req, res) => {
    try {
        const bookings = await Booking.find({ tutor: req.params.tutorId })
            .populate('student', 'name email')
            .populate('availability')
            .populate('session')
            .sort({ bookingDate: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CANCEL BOOKING
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Completed bookings cannot be cancelled'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Create cancellation notification for the tutor
        try {
            const studentUser = await User.findById(booking.student);
            const studentName = studentUser ? studentUser.name : 'A student';
            const bookingDateStr = new Date(booking.bookingDate).toLocaleDateString();

            await Notification.create({
                recipient: booking.tutor,
                message: `${studentName} cancelled their booking for ${bookingDateStr}.`,
                relatedBooking: booking._id,
                type: 'booking'
            });
            console.log('Cancellation Notification Created for Tutor:', booking.tutor);
        } catch (notificationError) {
            console.error('FAILED TO CREATE CANCELLATION NOTIFICATION:', notificationError.message);
        }

        // Free the availability slot logic removed to support recurring weekly bookings

        // Or adjust session participation if this booking was for a session
        if (booking.session) {
            const session = await Session.findById(booking.session);
            if (session) {
                session.currentParticipants = Math.max(0, session.currentParticipants - 1);
                if (session.status === 'booked' && session.currentParticipants < session.maxParticipants) {
                    session.status = 'available';
                }
                await session.save();
            }
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

