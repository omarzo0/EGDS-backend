const Joi = require("joi");
const { getI18ValidationMessage } = require("../../utils/i18n");

const createAdminSchema = Joi.object({
  first_name: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("firstName.required"),
      "any.required": getI18ValidationMessage("firstName.required"),
    }),
  last_name: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("lastName.required"),
      "any.required": getI18ValidationMessage("lastName.required"),
    }),
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
  role: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("role.required"),
      "any.required": getI18ValidationMessage("role.required"),
    }),
  birthday_date: Joi.date()
    .required()
    .messages({
      "date.base": getI18ValidationMessage("birthdayDate.invalid"),
      "any.required": getI18ValidationMessage("birthdayDate.required"),
    }),
  national_id: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("nationalId.required"),
      "any.required": getI18ValidationMessage("nationalId.required"),
    }),
  phone_number: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("phoneNumber.required"),
      "any.required": getI18ValidationMessage("phoneNumber.required"),
    }),
});
const updateAdminSchema = Joi.object({
  first_name: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("firstName.required"),
    }),
  last_name: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("lastName.required"),
    }),
  email: Joi.string()
    .trim()
    .email()
    .messages({
      "string.email": getI18ValidationMessage("email.invalid"),
      "string.empty": getI18ValidationMessage("email.required"),
    }),

  role: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("role.required"),
    }),
  birthday_date: Joi.date().messages({
    "date.base": getI18ValidationMessage("birthdayDate.invalid"),
  }),
  national_id: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("nationalId.required"),
    }),
  phone_number: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("phoneNumber.required"),
    }),
});

module.exports = { createAdminSchema, updateAdminSchema };
