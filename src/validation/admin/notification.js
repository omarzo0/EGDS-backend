const Joi = require("joi");
const { getI18ValidationMessage } = require("../../utils/i18n");

const notificationSchema = Joi.object({
  title: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("notification.title.required"),
      "any.required": getI18ValidationMessage("notification.title.required"),
    }),

  message: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("notification.message.required"),
      "any.required": getI18ValidationMessage("notification.message.required"),
    }),

  role: Joi.string()
    .trim()
    .optional()
    .messages({
      "string.base": getI18ValidationMessage("notification.role.invalid"),
    }),
});

module.exports = {
  notificationSchema,
};
