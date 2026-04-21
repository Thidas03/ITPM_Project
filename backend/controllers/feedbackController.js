const Feedback = require("../models/Feedback");

// Submit new feedback
const createFeedback = async (req, res) => {
  try {
    const { sessionId, studentId, tutorName, rating, comment, category } = req.body;

    if (!sessionId || !studentId || !tutorName || !rating || !comment) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const existingFeedback = await Feedback.findOne({ sessionId, studentId });

    if (existingFeedback) {
      return res.status(400).json({
        message: "Feedback already submitted for this session",
      });
    }

    const newFeedback = new Feedback({
      sessionId,
      studentId,
      tutorName,
      rating,
      comment,
      category,
    });

    await newFeedback.save();

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: newFeedback,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};

// Admin view: get all feedback
const getAllFeedback = async (req, res) => {
  try {
    const allFeedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(allFeedback);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch all feedback",
      error: error.message,
    });
  }
};

// Tutor view: anonymous feedback only
const getTutorFeedback = async (req, res) => {
  try {
    const { tutorName } = req.params;

    if (!tutorName) {
      return res.status(400).json({
        message: "Tutor Name is required",
      });
    }

    const feedbackList = await Feedback.find({ 
      $or: [
        { tutorName: { $regex: new RegExp(tutorName, "i") } },
        { tutorId: tutorName }
      ]
    })
      .select("sessionId rating comment category createdAt status")
      .sort({ createdAt: -1 });

    res.status(200).json(feedbackList);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tutor feedback",
      error: error.message,
    });
  }
};

// Update feedback status
const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    if (!["approved", "hidden", "flagged"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      message: "Feedback status updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update feedback status",
      error: error.message,
    });
  }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete feedback",
      error: error.message,
    });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getTutorFeedback,
  updateFeedbackStatus,
  deleteFeedback,
};