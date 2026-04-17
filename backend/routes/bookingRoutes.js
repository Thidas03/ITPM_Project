const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createBooking,
    getStudentBookings,
    cancelBooking,
    getSessionDetails,
    completeBooking,
    rateBooking,
    getBookingsByStudent,
    getBookingsByTutor,
    createSessionBooking
} = require('../controllers/bookingController');

// All booking routes are protected
router.use(protect);

router.post('/', createBooking);
router.post('/session', createSessionBooking);
router.get('/my-bookings', getStudentBookings);
router.get('/student/:studentId', getBookingsByStudent);
router.get('/tutor/:tutorId', getBookingsByTutor);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/complete', completeBooking);
router.put('/:id/rate', rateBooking);
router.get('/session/:sessionId', getSessionDetails);
router.patch('/session/:sessionId/join', require('../controllers/bookingController').joinSession);
router.patch('/session/:sessionId/leave', require('../controllers/bookingController').leaveSession);

module.exports = router;
