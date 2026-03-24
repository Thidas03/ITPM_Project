const User = require('../models/User');
const Session = require('../models/Session');
const Booking = require('../models/Booking');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const studentCount = await User.countDocuments({ role: 'Student' });
        const hostCount = await User.countDocuments({ role: 'Host' });
        const sessionCount = await Session.countDocuments();
        const bookingCount = await Booking.countDocuments();

        // Simple revenue calculation (mocked for now)
        const totalRevenue = bookingCount * 25; // Assuming $25 average

        res.json({
            success: true,
            stats: {
                users: userCount,
                students: studentCount,
                hosts: hostCount,
                sessions: sessionCount,
                bookings: bookingCount,
                revenue: totalRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort('-createdAt');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user status (block/unblock)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isBlocked = req.body.isBlocked;
        if (user.isBlocked) {
            user.blockedUntil = req.body.blockedUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
        } else {
            user.blockedUntil = null;
        }

        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all sessions
// @route   GET /api/admin/sessions
// @access  Private/Admin
exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find().populate('tutor', 'firstName lastName email').sort('-createdAt');
        res.json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user (Soft Delete)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isActive = false;
        await user.save();
        res.json({ success: true, message: 'User marked as inactive (Soft Deleted)' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new user manually
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, role, contactNumber, password } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Use temporary password if none provided
        const tempPassword = password || Math.random().toString(36).slice(-8) + 'A@1';

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber: contactNumber || '0000000000',
            password: tempPassword,
            role: role || 'Student',
            isVerified: true,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                temporaryPassword: tempPassword
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user details & role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { firstName, lastName, contactNumber, role, isActive, isBlocked, tutorRequestStatus } = req.body;

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (contactNumber) user.contactNumber = contactNumber;
        
        // RBAC changes
        if (role) {
            user.role = role;
            // If admin sets to Host, automatically approve request if pending
            if (role === 'Host' && user.tutorRequestStatus === 'pending') {
                user.tutorRequestStatus = 'approved';
            }
        }
        
        if (isActive !== undefined) user.isActive = isActive;
        if (isBlocked !== undefined) user.isBlocked = isBlocked;
        if (tutorRequestStatus !== undefined) user.tutorRequestStatus = tutorRequestStatus;

        const updatedUser = await user.save();
        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
