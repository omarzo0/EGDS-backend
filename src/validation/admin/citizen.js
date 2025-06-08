const Joi = require("joi");
const { getI18ValidationMessage } = require("../../utils/i18n");

const createCitizenSchema = Joi.object({
  first_name: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("firstName.required"),
      "any.required": getI18ValidationMessage("firstName.required"),
    }),
  middle_name: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("middleName.required"),
      "any.required": getI18ValidationMessage("middleName.required"),
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
  date_of_birth: Joi.date()
    .required()
    .messages({
      "date.base": getI18ValidationMessage("dateOfBirth.invalid"),
      "any.required": getI18ValidationMessage("dateOfBirth.required"),
    }),
  national_id: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("nationalId.required"),
      "any.required": getI18ValidationMessage("nationalId.required"),
    }),
  address: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("address.required"),
      "any.required": getI18ValidationMessage("address.required"),
    }),
  phone_number: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("phoneNumber.required"),
      "any.required": getI18ValidationMessage("phoneNumber.required"),
    }),
  Government: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("government.required"),
      "any.required": getI18ValidationMessage("government.required"),
    }),
  gender: Joi.string()
    .valid("male", "female", "other")
    .required()
    .messages({
      "any.only": getI18ValidationMessage("gender.invalid"),
      "string.empty": getI18ValidationMessage("gender.required"),
      "any.required": getI18ValidationMessage("gender.required"),
    }),
  marital_status: Joi.string()
    .valid("single", "married", "divorced", "widowed")
    .required()
    .messages({
      "any.only": getI18ValidationMessage("maritalStatus.invalid"),
      "string.empty": getI18ValidationMessage("maritalStatus.required"),
      "any.required": getI18ValidationMessage("maritalStatus.required"),
    }),
});

const updateCitizenSchema = Joi.object({
  first_name: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("firstName.required"),
    }),
  middle_name: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("middleName.required"),
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
  password: Joi.string()
    .trim()
    .min(6)
    .max(30)
    .messages({
      "string.min": getI18ValidationMessage("password.minLength"),
      "string.max": getI18ValidationMessage("password.maxLength"),
      "string.empty": getI18ValidationMessage("password.required"),
    }),
  date_of_birth: Joi.date().messages({
    "date.base": getI18ValidationMessage("dateOfBirth.invalid"),
  }),
  national_id: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("nationalId.required"),
    }),
  address: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("address.required"),
    }),
  phone_number: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("phoneNumber.required"),
    }),
  Government: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("government.required"),
    }),
  gender: Joi.string()
    .valid("male", "female", "other")
    .messages({
      "any.only": getI18ValidationMessage("gender.invalid"),
      "string.empty": getI18ValidationMessage("gender.required"),
    }),
  marital_status: Joi.string()
    .valid("single", "married", "divorced", "widowed")
    .messages({
      "any.only": getI18ValidationMessage("maritalStatus.invalid"),
      "string.empty": getI18ValidationMessage("maritalStatus.required"),
    }),
});

module.exports = {
  createCitizenSchema,
  updateCitizenSchema,
};
