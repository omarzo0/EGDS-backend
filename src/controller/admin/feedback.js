const FeedbackModel = require("../../database/models/feedback");

const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await FeedbackModel.find()
      .populate("citizen", "name email")
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

const updateFeedbackStatus = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback ID format",
      });
    }

    // Validate the status
    if (!["New", "Reviewed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'New' or 'Reviewed'",
      });
    }

    const updatedFeedback = await FeedbackModel.findByIdAndUpdate(
      feedbackId,
      { status },
      {
        new: true,
        runValidators: true,
      }
    ).populate("citizen", "name email");

    if (!updatedFeedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback status updated successfully",
      data: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error updating feedback status",
      error: error.message,
    });
  }
};

module.exports = {
  getAllFeedback,
  updateFeedbackStatus,
};
