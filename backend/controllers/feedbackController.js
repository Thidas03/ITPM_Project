const Feedback = require('../models/Feedback');

const createFeedback = async (req, res) => {
    try {
        const { sessionId, studentId, tutorId, rating, reviewText } = req.body;

        if (!sessionId || !studentId || !tutorId || !rating) {
            return res.status(400).json({
                msg: 'sessionId, studentId, tutorId, and rating are required',
            });
        }

        const existingFeedback = await Feedback.findOne({ sessionId, studentId });

        if (existingFeedback) {
            return res.status(400).json({
                msg: 'Feedback for this session already exists',
            });
        }

        const feedback = new Feedback({
            sessionId,
            studentId,
            tutorId,
            rating,
            reviewText,
        });

        await feedback.save();

        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({
            msg: 'Server error while creating feedback',
            error: error.message,
        });
    }
};

const getFeedback = async (req, res) => {
    try {
        const { tutorId } = req.params;

        const feedbackList = await Feedback.find({
            tutorId,
            status: 'approved',
        })
            .populate('studentId', 'name email')
            .sort({ createdAt: -1 });

        res.json(feedbackList);
    } catch (error) {
        res.status(500).json({
            msg: 'Server error while fetching all feedback',
            error: error.message,
        });
    }
};

const updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'hidden', 'flagged'].includes(status)) {
            return res.status(400).json({
                msg: 'Invalid status value',
            });
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedFeedback) {
            return res.status(404).json({
                msg: 'Feedback not found',
            });
        }

        res.json(updatedFeedback);
    } catch (error) {
        res.status(500).json({
            msg: 'Server error while updating feedback status',
            error: error.message,
        });
    }
};

const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedFeedback = await Feedback.findByIdAndDelete(id);

        if (!deletedFeedback) {
            return res.status(404).json({
                msg: 'Feedback not found',
            });
        }

        res.json({
            msg: 'Feedback deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            msg: 'Server error while deleting feedback',
            error: error.message,
        });
    }
};

module.exports = {
    createFeedback,
    getFeedback,
    updateFeedbackStatus,
    deleteFeedback,
};