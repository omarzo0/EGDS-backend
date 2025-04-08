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
    points: { type: Number, required: true },
    processing_time: { type: String, required: true },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ServiceModel =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);

module.exports = ServiceModel;
