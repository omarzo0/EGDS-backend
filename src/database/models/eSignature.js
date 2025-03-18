const mongoose = require("mongoose");

const eSignatureSchema = new mongoose.Schema(
  {
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    document_type: {
      type: String,
      required: true,
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
