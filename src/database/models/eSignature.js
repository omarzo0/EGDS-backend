const mongoose = require("mongoose");

const eSignatureSchema = new mongoose.Schema(
  {
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      index: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    uploaded_document: {
      type: String,
      required: true,
    },
    signed_document: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Signed", "Rejected", "Processing"],
      default: "Pending",
    },
    rejection_reason: {
      type: String,
      required: function () {
        return this.status === "Rejected";
      },
    },
    uploaded_date: {
      type: Date,
      default: Date.now,
    },
    signed_date: {
      type: Date,
    },
  },
  { timestamps: true }
);

const eSignatureModel =
  mongoose.models.eSignature || mongoose.model("eSignature", eSignatureSchema);

module.exports = { eSignatureModel };
