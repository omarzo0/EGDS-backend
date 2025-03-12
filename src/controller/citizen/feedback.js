const Feedback = require("../models/Feedback");
const { citizenIsAuth } = require("../middleware/auth");

const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ citizenId: req.citizenId }).sort({
      createdAt: -1,
    });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving feedback", error });
  }
};

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
  getFeedback,
  createFeedback,
};
