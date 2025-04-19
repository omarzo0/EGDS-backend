const Feedback = require("../../database/models/feedback");
const { CitizenModel } = require("../../database/models/citizen");

const createFeedback = async (req, res) => {
  try {
    const { feedback_text, rating, citizenId } = req.body;

    // Validate required fields
    if (!feedback_text) {
      return res.status(400).json({
        success: false,
        message: "Feedback text is required",
      });
    }

    if (!citizenId) {
      return res.status(400).json({
        success: false,
        message: "Citizen ID is required",
      });
    }

    // Validate rating (1-5 if provided)
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if citizen exists by ID
    const citizen = await CitizenModel.findById(citizenId);
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    // Create and save feedback with citizen reference
    const feedback = new Feedback({
      Citizen_id: citizenId,
      feedback_text,
      rating: rating,
    });

    await feedback.save();

    // Successful response
    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: {
        id: feedback._id,
        Citizen_id: feedback.Citizen_id,
        national_id: citizen.national_id, // Still include for reference if needed
        feedback_text: feedback.feedback_text,
        rating: feedback.rating,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error) {
    console.error("Feedback creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getFeedbackByCitizenId = async (req, res) => {
  try {
    const { citizenId } = req.params;

    // Validate citizenId
    if (!citizenId) {
      return res.status(400).json({
        success: false,
        message: "Citizen ID is required",
      });
    }

    // Check if citizen exists
    const citizen = await CitizenModel.findById(citizenId);
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    // Get all feedback for this citizen
    const feedbacks = await Feedback.find({ Citizen_id: citizenId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Convert to plain JavaScript objects

    // Format response data
    const formattedFeedbacks = feedbacks.map((feedback) => ({
      id: feedback._id,
      feedback_text: feedback.feedback_text,
      rating: feedback.rating,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: {
        citizen: {
          id: citizen._id,
          national_id: citizen.national_id,
          name: `${citizen.first_name} ${citizen.last_name}`,
        },
        feedbacks: formattedFeedbacks,
        count: feedbacks.length,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve feedback",
      error: error.message,
    });
  }
};

module.exports = {
  createFeedback,
  getFeedbackByCitizenId,
};
