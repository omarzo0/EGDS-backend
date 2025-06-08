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

const addChatQuestion = async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res
      .status(400)
      .json({ message: "Both question and answer are required" });
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

const updateChatQuestion = async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  if (!question && !answer) {
    return res.status(400).json({
      message: "At least one field (question or answer) is required to update",
    });
  }

  try {
    const updateData = {};
    if (question) updateData.question = question.trim();
    if (answer) updateData.answer = answer;

    const updatedQuestion = await ChatModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true } // Return updated doc and run validators
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    return res.status(200).json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating question",
      error: error.message,
    });
  }
};

const deleteChatQuestion = async (req, res) => {
  try {
    const deletedQuestion = await ChatModel.findByIdAndDelete(req.params.id);

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

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
  updateChatQuestion,
  deleteChatQuestion,
};
