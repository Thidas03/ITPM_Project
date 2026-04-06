const User = require('../models/User');
const Session = require('../models/Session');
const Booking = require('../models/Booking');
const AuditLog = require('../models/AuditLog');
const Transaction = require('../models/Transaction');

// @desc    Get admin's personal action history
// @route   GET /api/admin/history
// @access  Private/Admin
exports.getAdminHistory = async (req, res) => {
    try {
        const logs = await AuditLog.find({ admin: req.user.id }).sort('-createdAt');
        res.json({
            success: true,
            logs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
        const totalRevenue = bookingCount * 2500; // Assuming Rs. 2500 average per session

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

        // Create Audit Log
        await AuditLog.create({
            admin: req.user.id,
            action: 'Role Updated',
            target: user.email,
            details: `Status changed to ${user.isBlocked ? 'Blocked' : 'Active'}`
        });

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
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Create Audit Log
        await AuditLog.create({
            admin: req.user.id,
            action: 'User Deleted',
            target: user.email,
            details: 'Permanently deleted user'
        });

        res.json({ success: true, message: 'User deleted permanently' });
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
        
        // Name Validation
        if (firstName && !/^[A-Z]/.test(firstName)) {
            return res.status(400).json({ message: 'First name must start with a capital letter' });
        }
        if (lastName && !/^[A-Z]/.test(lastName)) {
            return res.status(400).json({ message: 'Last name must start with a capital letter' });
        }

        // Email Validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }
        
        let user = await User.findOne({ email });
        
        if (user) {
            // Prevent Admin from changing their own role to non-admin
            if (user._id.toString() === req.user.id.toString() && role !== 'Admin') {
                return res.status(400).json({ message: 'Operation blocked: You cannot downgrade your own administrative role.' });
            }

            // Update role if it's different
            if (role && role !== user.role) {
                const oldRole = user.role;
                user.role = role;
                // Auto-approve if upgrading to Host from Student
                if (role === 'Host' && oldRole === 'Student') {
                    user.tutorRequestStatus = 'approved';
                }
                await user.save();
                return res.json({
                    success: true,
                    message: `User role upgraded from ${oldRole} to ${role} successfully`,
                    user
                });
            }
            return res.status(400).json({ message: `User already exists as a ${user.role}` });
        }

        // Validate required fields for NEW users
        if (!firstName || !lastName || !email) {
            return res.status(400).json({ message: 'First name, last name, and email are required for new users' });
        }

        // Use temporary password if none provided
        const tempPassword = password || Math.random().toString(36).slice(-8) + 'A@1';

        user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber: contactNumber || '0000000000',
            password: tempPassword,
            role: role || 'Student',
            isVerified: true,
            isActive: true
        });

        // Create Audit Log
        await AuditLog.create({
            admin: req.user.id,
            action: 'User Created',
            target: email,
            details: `Manually created user with role ${role || 'Student'}`
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

        // Name Validation
        if (firstName && !/^[A-Z]/.test(firstName)) {
            return res.status(400).json({ message: 'First name must start with a capital letter' });
        }
        if (lastName && !/^[A-Z]/.test(lastName)) {
            return res.status(400).json({ message: 'Last name must start with a capital letter' });
        }

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

        // Create Audit Log
        await AuditLog.create({
            admin: req.user.id,
            action: 'Role Updated',
            target: updatedUser.email,
            details: `Updated details and/or role to ${updatedUser.role}`
        });

        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all transactions (Financial History)
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('userId', 'firstName lastName email identityNumber')
            .sort('-createdAt');
        res.json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
