const Booking = require('../models/Booking');
const Session = require('../models/Session');
const Availability = require('../models/Availability');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Transaction = require('../Mageepan/models/Transaction');
const { generatePaymentReceiptPDF } = require('../utils/pdfGenerator');
const { sendSessionConfirmation } = require('../services/emailService');
const { syncAttendance } = require('../utils/attendanceSync');

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const normalizeDate = (value) => {
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return d;
};

// @desc    Create a new booking / CREATE BOOKING
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const studentId = req.user._id; // From protect middleware
        if (req.body.availability) {
            const { availability: availabilityId, bookingDate } = req.body;
            if (!availabilityId || !bookingDate) {
                return res.status(400).json({ success: false, message: 'Missing fields' });
            }

            const bookingDay = normalizeDate(bookingDate);
            const today = normalizeDate(new Date());
            if (bookingDay < today) {
                return res.status(400).json({ success: false, message: 'Cannot book past date' });
            }

            const availability = await Availability.findById(availabilityId);
            if (!availability) {
                return res.status(404).json({ success: false, message: 'Availability not found' });
            }

            const weekdayName = dayNames[bookingDay.getDay()];
            if (weekdayName !== availability.dayOfWeek) {
                return res.status(400).json({ success: false, message: `Must be a ${availability.dayOfWeek}` });
            }

            const conflict = await Booking.findOne({
                availability: availabilityId,
                bookingDate: bookingDay,
                status: { $in: ['upcoming', 'confirmed'] }
            });
            if (conflict) {
                return res.status(400).json({ success: false, message: 'Already booked' });
            }

            const meetingLink = `https://meet.jit.si/STUEDU-${Math.random().toString(36).substring(2, 12)}`;
            const booking = await Booking.create({
                student: studentId,
                tutor: availability.tutor,
                availability: availability._id,
                bookingDate: bookingDay,
                meetingLink,
                status: 'upcoming'
            });

            // Log a mock transaction for the booking
            const amount = 50; // Mock price
            await Transaction.create({
                userId: studentId,
                sessionId: availability._id,
                stripeSessionId: `mock_stripe_${Math.random().toString(36).substring(2, 10)}`,
                amount: amount,
                platformFee: amount * 0.2,
                tutorEarnings: amount * 0.8,
                tutorId: availability.tutor,
                status: 'held_in_escrow'
            });

            try {
                const studentUser = await User.findById(studentId);
                const tutorUser = await User.findById(availability.tutor);
                const studentName = studentUser ? studentUser.firstName : 'Unknown';
                await Notification.create({
                    recipient: availability.tutor,
                    message: `${studentName} booked your session for ${bookingDay.toDateString()} at ${availability.startTime}`,
                    relatedBooking: booking._id,
                    type: 'booking'
                });

                // Generate and Send the PDF Email for the mock booking
                if (studentUser && studentUser.email) {
                    const details = {
                        studentName: studentName,
                        courseName: '1-on-1 Tutoring Session',
                        tutorName: tutorUser ? `${tutorUser.firstName} ${tutorUser.lastName}` : 'Your Tutor',
                        price: amount,
                        password: 'STU_PASS_123',
                        date: bookingDay.toDateString(),
                        time: `${availability.startTime} - ${availability.endTime}`
                    };
                    const pdfBuffer = await generatePaymentReceiptPDF(details);
                    await sendSessionConfirmation(studentUser.email, details, pdfBuffer);
                }
            } catch (notifErr) {
                console.error("Failed to process mock notification or email:", notifErr);
            }

            return res.status(201).json({ success: true, data: booking });
        } else {
            const { session, notes } = req.body;
            const sessionDoc = await Session.findById(session);
            if (!sessionDoc) return res.status(404).json({ message: 'Session not found' });

            const existingBooking = await Booking.findOne({ session, student: studentId });
            if (existingBooking) return res.status(400).json({ message: 'You have already booked this session' });

            const booking = await Booking.create({
                session,
                student: studentId,
                notes,
                status: 'upcoming'
            });

            const amount = sessionDoc.price || 50;
            await Transaction.create({
                userId: studentId,
                sessionId: session,
                stripeSessionId: `mock_stripe_${Math.random().toString(36).substring(2, 10)}`,
                amount: amount,
                platformFee: amount * 0.2,
                tutorEarnings: amount * 0.8,
                tutorId: sessionDoc.tutor,
                status: 'held_in_escrow'
            });

            await Availability.findOneAndUpdate(
                { _id: session },
                { $addToSet: { enrolledStudents: studentId } }
            );

            try {
                const studentUser = await User.findById(studentId);
                const tutorUser = await User.findById(sessionDoc.tutor);
                const studentName = studentUser ? studentUser.firstName : 'Unknown';
                await Notification.create({
                    recipient: sessionDoc.tutor,
                    message: `${studentName} booked your session.`,
                    relatedBooking: booking._id,
                    type: 'booking'
                });

                // Generate and Send the PDF Email for the mock booking
                if (studentUser && studentUser.email) {
                    const details = {
                        studentName: studentName,
                        courseName: sessionDoc.title || '1-on-1 Tutoring Session',
                        tutorName: tutorUser ? `${tutorUser.firstName} ${tutorUser.lastName}` : 'Your Tutor',
                        price: amount,
                        password: sessionDoc.password || 'STU_PASS_123',
                        date: sessionDoc.date ? new Date(sessionDoc.date).toDateString() : 'N/A',
                        time: sessionDoc.startTime ? `${sessionDoc.startTime} - ${sessionDoc.endTime}` : 'N/A'
                    };
                    const pdfBuffer = await generatePaymentReceiptPDF(details);
                    await sendSessionConfirmation(studentUser.email, details, pdfBuffer);
                }
            } catch (notifErr) {
                console.error("Failed to process mock notification or email:", notifErr);
            }

            return res.status(201).json({ success: true, booking });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE BOOKING FOR A SCHEDULED SESSION
exports.createSessionBooking = async (req, res) => {
    try {
        const { session: sessionId } = req.body;
        const studentId = req.user._id;

        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const sessionDay = normalizeDate(session.date);
        if (session.status === 'cancelled' || session.status === 'completed') {
            return res.status(400).json({ success: false, message: 'This session is no longer bookable' });
        }
        if (session.currentParticipants >= session.maxParticipants) {
            return res.status(400).json({ success: false, message: 'This session is fully booked' });
        }

        const existing = await Booking.findOne({ student: studentId, session: sessionId, status: { $in: ['upcoming', 'confirmed'] } });
        if (existing) return res.status(400).json({ success: false, message: 'You have already booked this session' });

        const meetingLink = `https://meet.jit.si/STUEDU-${Math.random().toString(36).substring(2, 12)}`;
        const booking = await Booking.create({
            student: studentId,
            tutor: session.tutor,
            session: session._id,
            bookingDate: sessionDay,
            meetingLink,
            status: 'upcoming'
        });

        const amount = session.price || 50;
        await Transaction.create({
            userId: studentId,
            sessionId: session._id,
            stripeSessionId: `mock_stripe_${Math.random().toString(36).substring(2, 10)}`,
            amount: amount,
            platformFee: amount * 0.2,
            tutorEarnings: amount * 0.8,
            tutorId: session.tutor,
            status: 'held_in_escrow'
        });

        session.currentParticipants += 1;
        if (session.currentParticipants >= session.maxParticipants) {
            session.status = 'booked';
        }
        await session.save();

        try {
            const studentUser = await User.findById(studentId);
            const tutorUser = await User.findById(session.tutor);
            const studentName = studentUser ? studentUser.firstName : 'Unknown';
            await Notification.create({
                recipient: session.tutor,
                message: `${studentName} has booked your scheduled session for ${sessionDay.toDateString()}.`,
                relatedBooking: booking._id,
                type: 'booking'
            });

            // Generate and Send the PDF Email for the mock booking
            if (studentUser && studentUser.email) {
                const details = {
                    studentName: studentName,
                    courseName: session.title || 'Scheduled Tutoring Session',
                    tutorName: tutorUser ? `${tutorUser.firstName} ${tutorUser.lastName}` : 'Your Tutor',
                    price: amount,
                    password: session.password || 'STU_PASS_123',
                    date: sessionDay.toDateString(),
                    time: session.startTime ? `${session.startTime} - ${session.endTime}` : 'N/A'
                };
                const pdfBuffer = await generatePaymentReceiptPDF(details);
                await sendSessionConfirmation(studentUser.email, details, pdfBuffer);
            }
        } catch (notifErr) {
            console.error("Failed to process mock notification or email:", notifErr);
        }

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message, stack: error.stack, message: error.message });
    }
};

// @desc    Get current student's bookings
exports.getStudentBookings = async (req, res) => {
    try {
        await syncAttendance(req.user._id, 'Student');
        const bookings = await Booking.find({ student: req.user._id })
            .populate('session')
            .populate('availability')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET BOOKINGS BY STUDENT (Admin or general)
exports.getBookingsByStudent = async (req, res) => {
    try {
        await syncAttendance(req.params.studentId, 'Student');
        const bookings = await Booking.find({ student: req.params.studentId })
            .populate('tutor', 'firstName lastName email')
            .populate('availability')
            .populate('session')
            .sort({ bookingDate: 1, createdAt: -1 });

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET BOOKINGS BY TUTOR
exports.getBookingsByTutor = async (req, res) => {
    try {
        const bookings = await Booking.find({ tutor: req.params.tutorId })
            .populate('student', 'firstName lastName email')
            .populate('availability')
            .populate('session')
            .sort({ bookingDate: 1, createdAt: -1 });

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Cancel booking
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (booking.status === 'cancelled' || booking.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Cannot cancel a completed or cancelled booking' });
        }

        booking.status = 'cancelled';
        await booking.save();

        if (booking.session) {
            const session = await Session.findById(booking.session);
            if (session) {
                session.currentParticipants = Math.max(0, session.currentParticipants - 1);
                if (session.status === 'booked' && session.currentParticipants < session.maxParticipants) {
                    session.status = 'available';
                }
                await session.save();
            }
            await Availability.findOneAndUpdate(
                { _id: booking.session },
                { $pull: { enrolledStudents: req.user._id } }
            );
        }

        try {
            const studentUser = await User.findById(req.user._id);
            if (studentUser) {
                studentUser.cancellations = (studentUser.cancellations || 0) + 1;
                await studentUser.save();
            }
            const studentName = studentUser ? studentUser.firstName : 'Unknown';
            const bookingDateStr = booking.bookingDate ? new Date(booking.bookingDate).toDateString() : 'a session';
            await Notification.create({
                recipient: booking.tutor,
                message: `${studentName} has cancelled their booking for ${bookingDateStr}.`,
                relatedBooking: booking._id,
                type: 'system'
            });
        } catch (notifErr) {}

        res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Complete booking
exports.completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, student: req.user._id }).populate('session');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status === 'completed') return res.status(400).json({ message: 'Session already completed' });

        booking.status = 'completed';
        booking.attended = true;
        booking.attendanceStatus = 'attended';
        await booking.save();

        res.json({ success: true, message: 'Session marked as attended' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Rate session
exports.rateBooking = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const booking = await Booking.findOne({ _id: req.params.id, student: req.user._id });
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

// @desc    Get session details
exports.getSessionDetails = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const userId = req.user._id;

        // 1) Weekly/availability-based "session"
        const availability = await Availability.findById(sessionId);
        if (availability) {
            if (!availability.enrolledStudents.includes(userId)) {
                return res.status(403).json({ success: false, error: 'Access Denied: You must book this session to view details' });
            }

            const sessionDetails = {
                id: availability._id,
                startTime: availability.startTime,
                endTime: availability.endTime,
                meetingLink: 'https://meet.jit.si/' + availability._id,
                password: 'STU_PASS_' + availability._id.toString().slice(-4).toUpperCase()
            };

            return res.status(200).json({ success: true, data: sessionDetails });
        }

        // 2) Scheduled session (Session model)
        const session = await Session.findById(sessionId).select('tutor startTime endTime meetingLink password');
        if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

        const isTutor = session.tutor.toString() === userId.toString();
        const hasBooking = await Booking.findOne({ session: sessionId, student: userId }).select('_id');

        if (!isTutor && !hasBooking) {
            return res.status(403).json({ success: false, error: 'Access Denied: You must book this session first.' });
        }

        const sessionDetails = {
            id: session._id,
            startTime: session.startTime,
            endTime: session.endTime,
            meetingLink: session.meetingLink || ('https://meet.jit.si/' + session._id),
            password: session.password || '',
            status: session.status,
            type: session.type
        };

        return res.status(200).json({ success: true, data: sessionDetails });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Student joins session
exports.joinSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const booking = await Booking.findOne({ session: sessionId, student: userId });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.joinTime) {
            return res.status(200).json({ success: true, message: 'Already joined', data: booking });
        }

        booking.joinTime = new Date();
        await booking.save();

        res.status(200).json({ success: true, message: 'Join time recorded', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Student leaves session & calculate attendance
exports.leaveSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const booking = await Booking.findOne({ session: sessionId, student: userId }).populate('session');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (!booking.joinTime) {
            return res.status(400).json({ success: false, message: 'Student never joined' });
        }

        if (booking.leaveTime) {
            return res.status(400).json({ success: false, message: 'Leave time already recorded' });
        }

        booking.leaveTime = new Date();
        
        // As per user request: if they didn't cancel, they participated.
        const isAttended = true;

        booking.attended = isAttended;
        booking.attendanceStatus = 'attended';
        booking.status = 'completed';
        await booking.save();

        // Update User Stats
        const student = await User.findById(userId);
        if (student) {
            student.attendedSessions += 1;
            student.trustScore = student.getTrustPercentage(); 
            await student.save();
        }

        res.status(200).json({ 
            success: true, 
            message: `Leave recorded. Attendance: ${booking.attendanceStatus}`,
            data: {
                attended: isAttended
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get session-wise attendance for a host
exports.getSessionAttendanceReport = async (req, res) => {
    try {
        const bookings = await Booking.find({ session: req.params.sessionId })
            .populate('student', 'firstName lastName email attendedSessions missedSessions')
            .sort('-attended');

        const attended = bookings.filter(b => b.attendanceStatus === 'attended').map(b => b.student);
        const missed = bookings.filter(b => b.attendanceStatus === 'missed').map(b => b.student);

        res.json({
            success: true,
            attended,
            missed,
            total: bookings.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


