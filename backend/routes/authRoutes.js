const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getTrustProfile, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile/trust', protect, getTrustProfile);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
