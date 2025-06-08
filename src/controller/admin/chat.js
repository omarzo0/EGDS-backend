const ChatModel = require("../../database/models/chat");
const {
  createChatSchema,
  updateChatSchema,
} = require("../../validation/admin/chat");
const {
  parseDuration,
  successResponseFormat,
  errorResponseFormat,
} = require("../../utils/response");
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
  try {
    const { error, value } = createChatSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json(
        errorResponseFormat(
          "Validation failed",
          error.details.map((detail) => detail.message)
        )
      );
    }

    const { question, answer } = value;

    // Check if question already exists
    const existingQuestion = await ChatModel.findOne({
      question: question.trim(),
    });

    if (existingQuestion) {
      return res
        .status(400)
        .json(errorResponseFormat("This question already exists"));
    }

    const chat = new ChatModel({
      question: question.trim(),
      answer,
    });
    await chat.save();

    return res.status(201).json(
      successResponseFormat({
        message: "Question added successfully",
        chat,
      })
    );
  } catch (error) {
    console.error("Error adding question:", error);
    return res
      .status(500)
      .json(errorResponseFormat("Error adding question", error.message));
  }
};

const updateChatQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const { error, value } = updateChatSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json(
        errorResponseFormat(
          "Validation failed",
          error.details.map((detail) => detail.message)
        )
      );
    }

    const updateData = {};
    if (value.question) updateData.question = value.question.trim();
    if (value.answer) updateData.answer = value.answer;

    const updatedQuestion = await ChatModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedQuestion) {
      return res.status(404).json(errorResponseFormat("Question not found"));
    }

    return res.status(200).json(
      successResponseFormat({
        message: "Question updated successfully",
        question: updatedQuestion,
      })
    );
  } catch (error) {
    console.error("Error updating question:", error);
    return res
      .status(500)
      .json(errorResponseFormat("Error updating question", error.message));
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
