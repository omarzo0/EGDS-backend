const Joi = require("joi");
const { getI18ValidationMessage } = require("../../utils/i18n");

const serviceSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage("service.name.required"),
      "any.required": getI18ValidationMessage("service.name.required"),
    }),

  departmentName: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": getI18ValidationMessage(
        "service.departmentName.required"
      ),
      "any.required": getI18ValidationMessage(
        "service.departmentName.required"
      ),
    }),

  Description: Joi.string()
    .trim()
    .allow("")
    .messages({
      "string.base": getI18ValidationMessage("service.description.invalid"),
    }),

  fees: Joi.number()
    .optional()
    .messages({
      "number.base": getI18ValidationMessage("service.fees.invalid"),
    }),

  processing_time: Joi.string()
    .trim()
    .optional()
    .messages({
      "string.base": getI18ValidationMessage("service.processingTime.invalid"),
    }),

  serviceType: Joi.string()
    .trim()
    .valid("application", "esignature")
    .optional()
    .messages({
      "any.only": getI18ValidationMessage("service.serviceType.invalid"),
      "string.base": getI18ValidationMessage("service.serviceType.invalid"),
    }),

  additionalInformation: Joi.string()
    .trim()
    .allow("")
    .messages({
      "string.base": getI18ValidationMessage(
        "service.additionalInformation.invalid"
      ),
    }),

  importantNotes: Joi.string()
    .trim()
    .allow("")
    .messages({
      "string.base": getI18ValidationMessage("service.importantNotes.invalid"),
    }),

  availableLocations: Joi.array()
    .items(Joi.string().trim())
    .optional()
    .messages({
      "array.base": getI18ValidationMessage(
        "service.availableLocations.invalid"
      ),
    }),
});

module.exports = {
  serviceSchema,
};
