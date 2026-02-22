const Availability = require('../models/Availability');

// @desc    Create availability
// @route   POST /api/availability
// @access  Public (for now)
exports.createAvailability = async (req, res) => {
    try {
        const { tutor, dayOfWeek, startTime, endTime } = req.body;

        const availability = await Availability.create({
            tutor,
            dayOfWeek,
            startTime,
            endTime
        });

        res.status(201).json({
            success: true,
            data: availability
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// @desc    Get availability by tutor
// @route   GET /api/availability/:tutorId
// @access  Public
exports.getAvailabilityByTutor = async (req, res) => {
    try {
        const availability = await Availability.find({
            tutor: req.params.tutorId,
            isBooked: false
        });

        res.status(200).json({
            success: true,
            count: availability.length,
            data: availability
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};