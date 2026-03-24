const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getTrustProfile,
    getUserProfile,
    updateUserProfile,
    googleLogin,
    forgotPasswordOTP,
    verifyResetOTP,
    resetPassword,
    verifyRegistrationOTP,
    verify2FA,
    toggle2FA,
    requestHostRole
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/google', googleLogin);
router.post('/forgot-password-otp', forgotPasswordOTP);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
router.post('/verify-registration-otp', verifyRegistrationOTP);
router.post('/verify-2fa', verify2FA);
router.post('/toggle-2fa', protect, toggle2FA);
router.get('/profile/trust', protect, getTrustProfile);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/request-host', protect, requestHostRole);

module.exports = router;
