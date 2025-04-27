const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    Description: { type: String, required: true },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    fees: { type: Number, required: true },
    processing_time: { type: String, required: true },
    usageCount: { type: Number, default: 0 },

    serviceType: {
      type: String,
      required: true,
      enum: ["application", "esignature"],
      default: "application",
    },
    additionalInformation: { type: String },
    importantNotes: { type: String },
    availableLocations: [
      {
        name: { type: String, required: true },
        address: { type: String, required: true },
        operatingHours: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const ServiceModel =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);

module.exports = ServiceModel;
