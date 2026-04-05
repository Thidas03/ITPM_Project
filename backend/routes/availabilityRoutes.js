const express = require('express');
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

const router = express.Router();

// POST /api/availability
router.post('/', createAvailability);

// GET /api/availability/:tutorId
router.get('/:tutorId', getAvailabilityByTutor);
// ORDER MATTERS
router.get('/', getAllAvailability);
router.post('/', createAvailability);

router.get('/tutor/:tutorId', getAvailabilityByTutor);

router.get('/:id', getAvailabilityById);
router.put('/cancel/:id', cancelAvailability);
router.put('/:id', updateAvailability);
router.delete('/:id', deleteAvailability);

router.get('/', (req, res) => {
    res.send("Availability GET works");
});

module.exports = router;
