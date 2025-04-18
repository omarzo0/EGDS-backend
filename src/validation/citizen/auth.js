const Joi = require("joi");
const { getI18ValidationMessage } = require("../../utils/i18n");

const citizenLoginSchema = Joi.object({
  national_id: Joi.string()
    .trim()
    .required()
    .pattern(/^\d{14}$/) // Adjust the regex pattern based on your national ID format
    .messages({
        "string.empty": getI18ValidationMessage("national_id.required"),
        "any.required": getI18ValidationMessage("national_id.required"),
        "string.pattern.base": getI18ValidationMessage("national_id.invalid"),
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

const citizenRegisterSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.min": getI18ValidationMessage("firstName.minLength"),
      "string.max": getI18ValidationMessage("firstName.maxLength"),
      "string.empty": getI18ValidationMessage("firstName.required"),
      "any.required": getI18ValidationMessage("firstName.required"),
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.min": getI18ValidationMessage("lastName.minLength"),
      "string.max": getI18ValidationMessage("lastName.maxLength"),
      "string.empty": getI18ValidationMessage("lastName.required"),
      "any.required": getI18ValidationMessage("lastName.required"),
    }),
  nationalId: Joi.string()
    .trim()
    .length(14)
    .regex(/^\d{14}$/)
    .required()
    .messages({
      "string.length": getI18ValidationMessage("nationalId.length"),
      "string.pattern.base": getI18ValidationMessage("nationalId.invalid"),
      "string.empty": getI18ValidationMessage("nationalId.required"),
      "any.required": getI18ValidationMessage("nationalId.required"),
    }),
  phone: Joi.string()
    .trim()
    .length(11)
    .regex(/^01[0-9]{9}$/)
    .required()
    .messages({
      "string.length": getI18ValidationMessage("phone.length"),
      "string.pattern.base": getI18ValidationMessage("phone.invalid"),
      "string.empty": getI18ValidationMessage("phone.required"),
      "any.required": getI18ValidationMessage("phone.required"),
    }),
  age: Joi.number()
    .integer()
    .min(18)
    .max(100)
    .required()
    .messages({
      "number.min": getI18ValidationMessage("age.min"),
      "number.max": getI18ValidationMessage("age.max"),
      "number.base": getI18ValidationMessage("age.invalid"),
      "any.required": getI18ValidationMessage("age.required"),
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
  confirmPassword: Joi.string()
    .trim()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": getI18ValidationMessage("password.match"),
      "string.empty": getI18ValidationMessage("password.confirmRequired"),
      "any.required": getI18ValidationMessage("password.confirmRequired"),
    }),
});

module.exports = { citizenLoginSchema, citizenRegisterSchema };
