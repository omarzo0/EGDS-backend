const Feedback = require("../../database/models/feedback");

const createFeedback = async (req, res) => {
  try {
    const { feedback_text, rating } = req.body;

    // Validate required fields
    if (!feedback_text) {
      return res.status(400).json({
        success: false,
        message: "Feedback text is required",
      });
    }

    // Validate rating (1-5 if provided)
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Create and save feedback
    const feedback = new Feedback({
      citizenId,
      feedback_text,
      rating: rating || null,
    });

    await feedback.save();

    // Successful response
    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: {
        id: feedback._id,
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
      error: error.message,
    });
  }
};

module.exports = {
  createFeedback,
};
