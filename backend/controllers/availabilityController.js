const Availability = require('../models/Availability');

// CREATE
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

// GET ALL
exports.getAllAvailability = async (req, res) => {
  try {
    const availability = await Availability.find();

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

// GET BY ID
exports.getAvailabilityById = async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability not found'
      });
    }

    res.status(200).json({
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

// GET BY TUTOR
exports.getAvailabilityByTutor = async (req, res) => {
  try {
    const availability = await Availability.find({
      tutor: req.params.tutorId
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

// UPDATE
exports.updateAvailability = async (req, res) => {
  try {
    const availability = await Availability.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
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

// CANCEL (soft cancel)
exports.cancelAvailability = async (req, res) => {
  try {
    const availability = await Availability.findByIdAndUpdate(
      req.params.id,
      { isBooked: true },
      { new: true }
    );

    res.status(200).json({
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

// DELETE (optional but good)
exports.deleteAvailability = async (req, res) => {
  try {
    console.log("Delete availability called with ID:", req.params.id);
    const deleted = await Availability.findByIdAndDelete(req.params.id);
    console.log("Delete result:", deleted);

    res.status(200).json({
      success: true,
      message: "Availability deleted",
      deleted
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};