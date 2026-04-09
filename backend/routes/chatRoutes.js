const express = require('express');
const { getMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/:sessionId')
    .get(protect, getMessages);

module.exports = router;
