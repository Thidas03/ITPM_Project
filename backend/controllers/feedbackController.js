const Feedback = require("../models/Feedback");

const createFeedback = async (req, res) => {
  try {
    const { sessionId, studentId, tutorId, rating, comment, category } = req.body;

    if (!sessionId || !studentId || !tutorId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Session ID, Student ID, Tutor ID, Rating and Comment are required",
      });
    }

    const newFeedback = new Feedback({
      sessionId,
      studentId,
      tutorId,
      rating,
      comment,
      category,
    });

    const savedFeedback = await newFeedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: savedFeedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create feedback",
      error: error.message,
    });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbackList.length,
      data: feedbackList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
};

const getFeedbackByTutor = async (req, res) => {
  try {
    const tutorId = req.params.tutorId.trim();

    // CHANGED: case-insensitive exact match after trimming
    const feedbackList = await Feedback.find({
      tutorId: { $regex: `^${tutorId}$`, $options: "i" },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbackList.length,
      data: feedbackList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tutor reviews",
      error: error.message,
    });
  }
};

const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Reviewed", "Resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
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
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback status updated successfully",
      data: updatedFeedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update feedback status",
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
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete feedback",
      error: error.message,
    });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackByTutor,
  updateFeedbackStatus,
  deleteFeedback,
};