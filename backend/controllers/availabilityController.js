const Availability = require('../models/Availability');

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

exports.getAvailabilityByTutor = async (req, res) => {
    try {
        const { studentId } = req.query;
        const availability = await Availability.find({
            tutor: req.params.tutorId,
            $expr: { $lt: [{ $size: "$enrolledStudents" }, "$maxStudents"] }
        });

        const formattedData = availability.map(slot => {
            const isBooked = studentId ? slot.enrolledStudents.includes(studentId) : false;
            return {
                ...slot._doc,
                isBookedByMe: isBooked
            };
        });

        res.status(200).json({
            success: true,
            count: formattedData.length,
            data: formattedData
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};