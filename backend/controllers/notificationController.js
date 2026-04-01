const Notification = require('../models/Notification');

// @desc    Get user's notification history
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt').limit(50);
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
exports.clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user.id });
        res.json({ success: true, message: 'Notifications cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
