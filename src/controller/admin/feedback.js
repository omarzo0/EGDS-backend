const FeedbackModel = require("../../database/models/feedback");

const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await FeedbackModel.find()
      .populate("citizen", "first_name middle_name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving feedback",
      error: error.message,
    });
  }
};

module.exports = {
  getAllFeedback,
};
