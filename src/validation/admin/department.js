const Joi = require("joi");
const { getI18ValidationMessage } = require("../../utils/i18n");

const createDepartmentSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("department.name.required"),
      "any.required": getI18ValidationMessage("department.name.required"),
    }),
  description: Joi.string()
    .trim()
    .allow("")
    .messages({
      "string.base": getI18ValidationMessage("department.description.invalid"),
    }),
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string()
    .trim()
    .messages({
      "string.empty": getI18ValidationMessage("department.name.required"),
    }),
  description: Joi.string()
    .trim()
    .allow("")
    .messages({
      "string.base": getI18ValidationMessage("department.description.invalid"),
    }),
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
};
