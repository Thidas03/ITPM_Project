const express = require('express');
const router = express.Router();

const {
    createSession,
    getSessionsByTutor,
    deleteSession,
    updateSession,
    getRecommendedSlot
} = require('../controllers/sessionController');

router.post('/', createSession);
router.get('/tutor/:tutorId', getSessionsByTutor);
router.get('/tutor/:tutorId/recommend', getRecommendedSlot);
router.put('/:sessionId', updateSession);
router.delete('/:sessionId', deleteSession);

module.exports = router;
