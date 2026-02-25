const express = require('express');
const {
    createAvailability,
    getAvailabilityByTutor
} = require('../controllers/availabilityController');

const router = express.Router();

// POST /api/availability
router.post('/', createAvailability);

// GET /api/availability/:tutorId
router.get('/:tutorId', getAvailabilityByTutor);

router.get('/', (req, res) => {
    res.send("Availability GET works");
});

module.exports = router;
