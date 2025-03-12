const Feedback = require("../models/Feedback");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find();
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving feedback", error });
    }
};

module.exports = {
  getAllFeedback: [verifyToken, isAdmin, getAllFeedback],
};