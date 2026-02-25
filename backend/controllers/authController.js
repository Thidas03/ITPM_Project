const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
            role
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                },
                token: generateToken(user._id)
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

        res.json({
            success: true,
            trustLevel: user.getTrustLevel(),
            bookingLimit: user.getBookingLimit(),
            stats: {
                attended: user.attendedSessions,
                missed: user.missedSessions,
                cancellations: user.cancellations,
                attendanceRate: ((user.attendedSessions / (user.attendedSessions + user.missedSessions || 1)) * 100).toFixed(1) + '%'
            },
            badges: user.calculateBadges(),
            isBlocked: user.isBlocked,
            blockedUntil: user.blockedUntil
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
                notificationPreferences: updatedUser.notificationPreferences
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
