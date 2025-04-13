const Feedback = require("../../database/models/feedback");
const {CitizenModel} = require("../../database/models/citizen"); 

const createFeedback = async (req, res) => {
  try {
    const { feedback_text, rating, national_id } = req.body; // Changed from citizen_id to national_id

    // Validate required fields
    if (!feedback_text) {
      return res.status(400).json({
        success: false,
        message: "Feedback text is required",
      });
    }

    if (!national_id) {
      return res.status(400).json({
        success: false,
        message: "National ID is required",
      });
    }

    // Validate rating (1-5 if provided)
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if citizen exists by national_id
    const citizen = await CitizenModel.findOne({ national_id });
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    // Create and save feedback with citizen reference
    const feedback = new Feedback({
      Citizen_id: citizen._id,  // Store the citizen's ObjectId
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
        Citizen_id: feedback.citizen_id,
        national_id: citizen.national_id, // Include national_id in response
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  createFeedback,
};
