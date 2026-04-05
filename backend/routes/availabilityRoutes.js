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

// ORDER MATTERS
router.get('/', getAllAvailability);
router.post('/', createAvailability);

router.get('/tutor/:tutorId', getAvailabilityByTutor);

router.get('/:id', getAvailabilityById);
router.put('/cancel/:id', cancelAvailability);
router.put('/:id', updateAvailability);
router.delete('/:id', deleteAvailability);

module.exports = router;