const Session = require('../models/Session');
const Booking = require('../models/Booking');
const User = require('../models/User');

/**
 * Synchronizes attendance for a user (student or tutor)
 * Marks past sessions as completed and records attendance if not cancelled.
 */
exports.syncAttendance = async (userId, role) => {
    const now = new Date();

    if (role === 'Student') {
        // Find all bookings for this student that are in the past and NOT completed/cancelled
        const bookings = await Booking.find({
            student: userId,
            status: 'upcoming'
        }).populate('session');

        for (const booking of bookings) {
            if (booking.session && new Date(booking.session.date) < now) {
                // This session is in the past. Assume participation if not cancelled.
                booking.status = 'completed';
                booking.attended = true;
                booking.attendanceStatus = 'attended';
                await booking.save();

                // Update User Stats
                const student = await User.findById(userId);
                if (student) {
                    student.attendedSessions = (student.attendedSessions || 0) + 1;
                    student.trustScore = student.getTrustPercentage();
                    await student.save();
                }
            }
        }
    }

    if (role === 'Host' || role === 'Tutor') {
        // Find all sessions for this tutor that are in the past and NOT completed/cancelled
        const sessions = await Session.find({
            tutor: userId,
            status: { $in: ['available', 'booked', 'active'] }
        });

        for (const session of sessions) {
            if (new Date(session.date) < now) {
                // Past session. Assume participation.
                session.status = 'completed';
                await session.save();

                // Update Tutor Stats
                const tutor = await User.findById(userId);
                if (tutor) {
                    tutor.attendedSessions = (tutor.attendedSessions || 0) + 1;
                    await tutor.save();
                }

                // Also finalize all bookings for this session
                const sessionBookings = await Booking.find({ session: session._id, status: 'upcoming' });
                for (const b of sessionBookings) {
                    b.status = 'completed';
                    b.attended = true;
                    b.attendanceStatus = 'attended';
                    await b.save();

                    const student = await User.findById(b.student);
                    if (student) {
                        student.attendedSessions = (student.attendedSessions || 0) + 1;
                        student.trustScore = student.getTrustPercentage();
                        await student.save();
                    }
                }
            }
        }
    }
};
