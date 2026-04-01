const express = require('express');
const { check, validationResult } = require('express-validator');
const {
    createAvailability,
    getAvailabilityByTutor
} = require('../controllers/availabilityController');

const router = express.Router();

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

router.post(
    '/',
    [
        check('tutor', 'Tutor ID is required').not().isEmpty(),
        check('dayOfWeek', 'Please select a valid day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
        check('startTime', 'Start time is required in HH:mm format').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        check('endTime', 'End time is required in HH:mm format').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        validate
    ],
    createAvailability
);
router.get('/:tutorId', getAvailabilityByTutor);

module.exports = router;