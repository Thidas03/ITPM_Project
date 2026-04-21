const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();

const {
  createAvailability,
  getAllAvailability,
  getAvailabilityById,
  getAvailabilityByTutor,
  updateAvailability,
  cancelAvailability,
  deleteAvailability
} = require('../controllers/availabilityController');

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

// POST /api/availability
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

// GET /api/availability
router.get('/', getAllAvailability);

// GET /api/availability/tutor/:tutorId
router.get('/tutor/:tutorId', getAvailabilityByTutor);

// GET /api/availability/:id
router.get('/:id', getAvailabilityById);

// PUT /api/availability/cancel/:id
router.put('/cancel/:id', cancelAvailability);

// PUT /api/availability/:id
router.put('/:id', updateAvailability);

// DELETE /api/availability/:id
router.delete('/:id', deleteAvailability);

module.exports = router;
