const ChatModel = require("../../database/models/chat");

const listChatQuestions = async (req, res) => {
  try {
    const questions = await ChatModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ questions });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving chat questions",
      error: error.message,
    });
  }
};

module.exports = {
  listChatQuestions,
};
