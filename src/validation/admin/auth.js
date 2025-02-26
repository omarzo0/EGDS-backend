const Joi = require("joi");
const { getI18ValidationMessage } = require("../../utils/i18n");

const adminLoginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      "string.email": getI18ValidationMessage("email.invalid"),
      "string.empty": getI18ValidationMessage("email.required"),
      "any.required": getI18ValidationMessage("email.required"),
    }),
  password: Joi.string()
    .trim()
    .min(6)
    .max(30)
    .required()
    .messages({
      "string.min": getI18ValidationMessage("password.minLength"),
      "string.max": getI18ValidationMessage("password.maxLength"),
      "string.empty": getI18ValidationMessage("password.required"),
      "any.required": getI18ValidationMessage("password.required"),
    }),
});

module.exports = { adminLoginSchema };
