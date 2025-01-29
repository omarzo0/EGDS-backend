const mongoose = require("mongoose");

const eSignatureSchema = new mongoose.Schema({
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    required: true,
  },
  document_type: { type: String, required: true },
  uploaded_document: { type: String, required: true },
  signed_document: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Signed", "Rejected"],
    default: "Pending",
  },
  uploaded_date: { type: Date, default: Date.now },
  signed_date: { type: Date },
});

const eSignature = mongoose.model("eSignature", eSignatureSchema);

module.exports = eSignature;
