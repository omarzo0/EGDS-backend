// src/controller/admin/chat.js
const ChatModel = require("../../database/models/chat");
const { adminIsAuth, adminAllowedTo } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");

const listChatQuestions = async (req, res) => {
  try {
    const questions = await ChatModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ questions });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving chat questions", error: error.message });
  }
};

const addChatQuestion = async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ message: "Both question and answer are required" });
  }
  try {
    const chat = new ChatModel({ question: question.trim(), answer });
    await chat.save();
    return res.status(201).json({ chat });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error adding question", error: error.message });
  }
};

const deleteChatQuestion = async (req, res) => {
  try {
    await ChatModel.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting question", error: error.message });
  }
};

module.exports = {
  listChatQuestions,
  addChatQuestion,
  deleteChatQuestion,
};
