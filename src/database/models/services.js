const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true, // Added for performance
    },
  },
  { timestamps: true }
);

const ServiceModel =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);

module.exports = { ServiceModel };
