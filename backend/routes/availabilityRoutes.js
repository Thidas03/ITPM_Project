const express = require('express');
const {
    createAvailability,
    getAvailabilityByTutor
} = require('../controllers/availabilityController');

const router = express.Router();

router.post('/', createAvailability);
router.get('/:tutorId', getAvailabilityByTutor);

module.exports = router;