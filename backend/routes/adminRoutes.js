const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    getAllSessions,
    deleteUser,
    createUser,
    updateUser,
    getAdminHistory
} = require('../controllers/adminController');

router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/history', getAdminHistory);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/status', updateUserStatus);
router.get('/sessions', getAllSessions);
router.delete('/users/:id', deleteUser);

module.exports = router;
