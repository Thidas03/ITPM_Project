const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createBooking,
    getStudentBookings,
    cancelBooking,
    completeBooking,
    rateBooking
} = require('../controllers/bookingController');

router.use(protect); // All routes require auth

router.get('/my-bookings', getStudentBookings);
router.post('/', createBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/complete', completeBooking);
router.put('/:id/rate', rateBooking);

module.exports = router;

const {
    createBooking,
    getBookingsByStudent,
    getBookingsByTutor,
    cancelBooking,
    createSessionBooking
} = require('../controllers/bookingController');

router.post('/', createBooking);
router.post('/session', createSessionBooking);
router.get('/student/:studentId', getBookingsByStudent);
router.get('/tutor/:tutorId', getBookingsByTutor);
router.put('/:id/cancel', cancelBooking);

module.exports = router;

