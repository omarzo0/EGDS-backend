const Feedback = require("../../database/models/feedback");

const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving feedback", error });
  }
};

// Function to update feedback status
const updateFeedbackStatus = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;

    // Validate the status
    const validStatuses = ["New", "Reviewed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res
      .status(200)
      .json({ message: "Feedback status updated", feedback: updatedFeedback });
  } catch (error) {
    res.status(500).json({ message: "Error updating feedback status", error });
  }
};

module.exports = {
  getAllFeedback,
  updateFeedbackStatus,
};
