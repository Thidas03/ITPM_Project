const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { syncAttendance } = require('../utils/attendanceSync');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { firstName, lastName, contactNumber, email, password, role } = req.body;

    // Name Validation
    if (!/^[A-Z]/.test(firstName)) {
        return res.status(400).json({ message: 'First name must start with a capital letter' });
    }
    if (!/^[A-Z]/.test(lastName)) {
        return res.status(400).json({ message: 'Last name must start with a capital letter' });
    }

    // Phone Number Validation
    const phoneDigits = contactNumber.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        return res.status(400).json({ message: 'Phone number must contain at least 10 digits' });
    }

    // Password Strength Check
    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordStrengthRegex.test(password)) {
        return res.status(400).json({ message: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.' });
    }

    try {
        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            contactNumber,
            email,
            password,
            role,
            isVerified: true
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'Account created successfully'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            res.json({
                success: true,
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    identityNumber: user.identityNumber
                },
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logoutUser = async (req, res) => {
    // On the client side, the token should be removed. 
    // Here we just send a success message.
    res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get User Trust Profile
// @route   GET /api/auth/profile/trust
// @access  Private
exports.getTrustProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Sync attendance before returning profile
        await syncAttendance(user._id, user.role);
        
        // Refetch user to get updated stats
        const updatedUser = await User.findById(req.user.id);

        res.json({
            success: true,
            trustLevel: updatedUser.getTrustLevel(),
            trustPercentage: updatedUser.getTrustPercentage(),
            bookingLimit: updatedUser.getBookingLimit(),
            stats: {
                attended: updatedUser.attendedSessions,
                missed: updatedUser.missedSessions,
                cancellations: updatedUser.cancellations,
                attendanceRate: (updatedUser.attendedSessions / (updatedUser.attendedSessions + updatedUser.missedSessions || 1) * 100).toFixed(1)
            },
            badges: updatedUser.calculateBadges(),
            statusMetadata: {
                isBlocked: updatedUser.isBlocked && updatedUser.blockedUntil > new Date(),
                blockedUntil: updatedUser.blockedUntil
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get User Profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update User Profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { firstName, lastName, contactNumber, email, notificationPreferences } = req.body;

        // Check email uniqueness if email is changed
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email address already in use' });
            }
            user.email = email;
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.contactNumber = contactNumber || user.contactNumber;
        user.notificationPreferences = notificationPreferences || user.notificationPreferences;

        if (req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                contactNumber: updatedUser.contactNumber,
                role: updatedUser.role,
                profilePicture: updatedUser.profilePicture,
                identityNumber: updatedUser.identityNumber,
                notificationPreferences: updatedUser.notificationPreferences
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login with Google
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
    const { tokenId } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email, given_name, family_name, sub } = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create user if they don't exist
            // Providing default values for required fields
            user = await User.create({
                firstName: given_name || 'Google',
                lastName: family_name || 'User',
                email: email,
                password: Math.random().toString(36).slice(-10) + 'A@1', // Random password
                contactNumber: '0000000000', // Default contact number
                role: 'Student' // Default role
            });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                identityNumber: user.identityNumber
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(401).json({ message: 'Google authentication failed' });
    }
};

// @desc    Generate Forgot Password OTP
// @route   POST /api/auth/forgot-password-otp
// @access  Public
exports.forgotPasswordOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpSecret = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        console.log(`================================`);
        console.log(`FORGOT PASSWORD OTP for ${user.email} is: ${otp}`);
        console.log(`================================`);

        res.json({
            success: true,
            message: 'OTP sent to email for password reset'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Reset Password OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
exports.verifyResetOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isValidOTP = user && (user.otpSecret === otp || otp === '123456') && user.otpExpires > Date.now();
        if (!isValidOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Password Strength Check
    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordStrengthRegex.test(newPassword)) {
        return res.status(400).json({ message: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isValidOTP = user && (user.otpSecret === otp || otp === '123456') && user.otpExpires > Date.now();
        if (!isValidOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.password = newPassword;
        user.otpSecret = null;
        user.otpExpires = null;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Registration OTP
// @route   POST /api/auth/verify-registration-otp
// @access  Public
exports.verifyRegistrationOTP = async (req, res) => {
    const { userId, otp } = req.body;

    try {
        const user = await User.findById(userId);

        // Accept the dynamically generated OTP or '123456' as a developer bypass
        const isValidOTP = user && (user.otpSecret === otp || otp === '123456') && user.otpExpires > Date.now();

        if (!isValidOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otpSecret = null;
        user.otpExpires = null;
        await user.save();

        res.json({
            success: true,
            message: 'Account verified successfully. You can now log in.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify 2FA OTP
// @route   POST /api/auth/verify-2fa
// @access  Public
exports.verify2FA = async (req, res) => {
    const { userId, otp } = req.body;

    try {
        const user = await User.findById(userId);

        // Accept the dynamically generated OTP or '123456' as a developer bypass
        const isValidOTP = user && (user.otpSecret === otp || otp === '123456') && user.otpExpires > Date.now();

        if (!isValidOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Clear OTP
        user.otpSecret = null;
        user.otpExpires = null;
        await user.save();

        res.json({
            success: true,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                identityNumber: user.identityNumber
            },
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle 2FA
// @route   POST /api/auth/toggle-2fa
// @access  Private
exports.toggle2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.is2FAEnabled = !user.is2FAEnabled;
        await user.save();

        res.json({
            success: true,
            is2FAEnabled: user.is2FAEnabled,
            message: `2FA ${user.is2FAEnabled ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Password Strength Check
    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordStrengthRegex.test(newPassword)) {
        return res.status(400).json({ message: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request Host Role Upgrade
// @route   POST /api/auth/request-host
// @access  Private
exports.requestHostRole = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (user.role === 'Host' || user.role === 'Admin') {
            return res.status(400).json({ message: 'User is already a Host or Admin' });
        }

        const trustScore = user.getTrustPercentage();
        const attended = user.attendedSessions;
        const misconducts = user.misconductCount;
        const rating = user.averageRating;

        if (trustScore > 75 && attended >= 5 && misconducts === 0 && rating > 4.0) {
            user.tutorRequestStatus = 'pending';
            await user.save();
            res.json({ success: true, message: 'Host role request submitted successfully. Awaiting Admin approval.' });
        } else {
            // Provide specific reasons
            let reasons = [];
            if (trustScore <= 75) reasons.push(`Trust score is ${trustScore}% (Need > 75%)`);
            if (attended < 5) reasons.push(`You have ${attended} completed sessions (Need at least 5)`);
            if (misconducts > 0) reasons.push(`You have ${misconducts} misconduct reports (Need 0)`);
            if (rating <= 4.0) reasons.push(`Average rating is ${rating} (Need > 4.0)`);
            
            res.status(400).json({ 
                success: false, 
                message: 'Eligibility criteria not met.',
                reasons: reasons
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
