const { required } = require("joi");
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    document_name: { type: String, required: true },
    document_type: {
      type: String,
      enum: [
        "Birth Certificate",
        "National ID",
        "Passport",
        "Marriage Certificate",
        "Death Certificate",
        "Driver's License",
        "others",
      ],
      required: true,
    },
    document_number: { type: String, required: true },
    issue_date: { type: Date, required: true },
    expiry_date: { type: Date, required: true },
    document_image: { type: String, required: true },
    status: {
      type: String,
      enum: ["Issued", "Pending", "Revoked", "Expired"],
      required: true,
    },
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
  },
  { timestamps: true }
);

const DocumentModel =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

module.exports = { DocumentModel };
