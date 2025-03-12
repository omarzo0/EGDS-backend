const Feedback = require("../../database/models/feedback");

const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving feedback", error });
  }
};

module.exports = {
  getAllFeedback,
};
