const Joi = require("joi");
const { getI18ValidationMessage } = require("../../utils/i18n");

const updateAdminProfileSchema = Joi.object({
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
  phone_number: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("phoneNumber.required"),
    }),
  birthday_date: Joi.date().messages({
    "date.base": getI18ValidationMessage("birthdayDate.invalid"),
  }),
  languagePreference: Joi.string()
    .valid("en", "ar")
    .messages({
      "any.only": getI18ValidationMessage("languagePreference.invalid"),
      "string.empty": getI18ValidationMessage("languagePreference.required"),
    }),
  current_password: Joi.string()
    .trim()
    .when("password", {
      is: Joi.exist(),
      then: Joi.required().messages({
        "any.required": getI18ValidationMessage("currentPassword.required"),
        "string.empty": getI18ValidationMessage("currentPassword.required"),
      }),
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
});

module.exports = {
  updateAdminProfileSchema,
};
