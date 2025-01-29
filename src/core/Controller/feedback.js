const Feedback = require("../../database/models/feedback");

// Submit Feedback
exports.submitFeedback = async (req, res) => {
  const { user_id, feedback_text, rating } = req.body;

  try {
    if (!user_id || !feedback_text || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const feedback = await Feedback.create({
      user_id,
      feedback_text,
      rating,
    });

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};

// Get Feedback (for admin or any authorized user)
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate(
      "user_id",
      "username email"
    );

    if (!feedback) {
      return res.status(404).json({ message: "No feedback found" });
    }

    res.status(200).json({ feedback });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch feedback", error: error.message });
  }
};

// Get Feedback by User (optional)
exports.getFeedbackByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const feedback = await Feedback.find({ user_id: userId }).populate(
      "user_id",
      "username email"
    );

    if (!feedback || feedback.length === 0) {
      return res
        .status(404)
        .json({ message: "No feedback found for this user" });
    }

    res.status(200).json({ feedback });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Failed to fetch feedback for user",
        error: error.message,
      });
  }
};
