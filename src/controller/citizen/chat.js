const ChatModel = require("../../database/models/chat");

const getChatQuestions = async (req, res) => {
  try {
    const questions = await ChatModel.find().sort({ createdAt: -1 });

    if (!questions.length) {
      return res.status(200).json({
        message: "No questions available",
        questions: [],
      });
    }

    return res.status(200).json({
      message: "Questions retrieved successfully",
      questions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving chat questions",
      error: error.message,
    });
  }
};

module.exports = {
  getChatQuestions,
};
