const Joi = require("joi");
const { getI18ValidationMessage } = require("../../utils/i18n");

const createChatSchema = Joi.object({
  question: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("chat.questionRequired"),
      "any.required": getI18ValidationMessage("chat.questionRequired"),
    }),
  answer: Joi.string()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("chat.answerRequired"),
      "any.required": getI18ValidationMessage("chat.answerRequired"),
    }),
});

const updateChatSchema = Joi.object({
  question: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("chat.questionRequired"),
    }),
  answer: Joi.string().messages({
    "string.empty": getI18ValidationMessage("chat.answerRequired"),
  }),
}).or("question", "answer");

module.exports = { createChatSchema, updateChatSchema };
