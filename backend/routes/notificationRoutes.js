const express = require('express');
const router = express.Router();

const {
    getNotifications,
    markAsRead,
    markAllAsRead
} = require('../controllers/notificationController');

router.get('/:recipientId', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/:recipientId/read-all', markAllAsRead);

module.exports = router;
