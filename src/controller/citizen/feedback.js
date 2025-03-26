const Feedback = require("../../database/models/feedback");

const createFeedback = async (req, res) => {
  try {
    const { feedback_text, rating } = req.body;
    if (message) {
      return res.status(400).json({ message: "Feedback message is required" });
    }
    const feedback = new Feedback({
      citizenId: req.citizenId,
      feedback_text,
      rating,
    });
    await feedback.save();
    res
      .status(201)
      .json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    res.status(500).json({ message: "Error creating feedback", error });
  }
};

module.exports = {
  createFeedback,
};
