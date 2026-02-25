const User = require('../models/User');
const Booking = require('../models/Booking');

const checkDynamicPermissions = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const trustLevel = user.getTrustLevel();

        // 1. Check if Blocked
        if (trustLevel === 'Blocked') {
            return res.status(403).json({
                message: `User is temporarily blocked until ${user.blockedUntil.toDateString()} due to frequent missed sessions.`
            });
        }

        // 2. Check Booking Limits
        const activeBookingsCount = await Booking.countDocuments({
            studentId: user._id,
            status: { $in: ['pending', 'confirmed'] }
        });

        const limit = user.getBookingLimit();

        if (activeBookingsCount >= limit) {
            return res.status(403).json({
                message: `Booking limit reached. Your current trust level (${trustLevel}) allows only ${limit} active bookings.`,
                trustLevel,
                limit
            });
        }

        // Attach trust info to request
        req.trustInfo = {
            level: trustLevel,
            limit: limit,
            badges: user.calculateBadges()
        };

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Middleware to check for Premium Access (High Trust only)
const premiumAccess = (req, res, next) => {
    const trustLevel = req.trustInfo?.level || 'Medium';

    if (trustLevel !== 'High' && req.user.role !== 'Admin') {
        return res.status(403).json({
            message: 'Early access to premium sessions is reserved for "High Trust" students with the Reliable Learner badge.'
        });
    }
    next();
};

module.exports = { checkDynamicPermissions, premiumAccess };
