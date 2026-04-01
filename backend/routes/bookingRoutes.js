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
