const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const ChatModel = mongoose.model("Chat", ChatSchema);

module.exports = ChatModel;
