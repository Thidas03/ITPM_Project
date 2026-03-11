const express = require('express');
const router = express.Router();

const {
    createSession,
    getSessionsByTutor,
    deleteSession,
    updateSession,
    getRecommendedSlot,
    bookSession,
    getSessionParticipants
} = require('../controllers/sessionController');

router.post('/', createSession);
router.get('/tutor/:tutorId', getSessionsByTutor);
router.get('/tutor/:tutorId/recommend', getRecommendedSlot);
router.put('/:sessionId', updateSession);
router.put('/:sessionId/book', bookSession);
router.get('/:sessionId/participants', getSessionParticipants);
router.delete('/:sessionId', deleteSession);

module.exports = router;
