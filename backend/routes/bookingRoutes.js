const express = require('express');
const router = express.Router();
const {
    createBooking,
    getStudentBookings,
    cancelBooking,
    getSessionDetails
} = require('../controllers/bookingController');

const { protect } = require('../middleware/auth');

// All booking routes are protected
router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getStudentBookings);
router.put('/:id/cancel', cancelBooking);
router.get('/session/:sessionId', getSessionDetails);

module.exports = router;
