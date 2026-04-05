const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getNotifications,
    markAsRead,
    clearNotifications
} = require('../controllers/notificationController');

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.delete('/', clearNotifications);

const {
    getNotifications,
    markAsRead,
    markAllAsRead
} = require('../controllers/notificationController');

router.get('/:recipientId', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/:recipientId/read-all', markAllAsRead);

module.exports = router;
