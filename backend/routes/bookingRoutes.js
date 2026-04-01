const express = require('express');
const router = express.Router();

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

