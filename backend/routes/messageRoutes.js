const express = require('express');
const { protect } = require('../middleware/auth');
const { getSessionMessages, createMessage, getLastMessage, getUnreadCount } = require('../controllers/messageController');

const router = express.Router();

// GET /api/messages/:sessionId
router.get('/:sessionId', protect, getSessionMessages);

// GET /api/messages/:sessionId/last
router.get('/:sessionId/last', protect, getLastMessage);

// GET /api/messages/:sessionId/unread-count?since=...
router.get('/:sessionId/unread-count', protect, getUnreadCount);

// POST /api/messages
router.post('/', protect, createMessage);

module.exports = router;

