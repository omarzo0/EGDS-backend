const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    document_type: {
      type: String,
      enum: [
        "Birth Certificate",
        "National ID",
        "Passport",
        "Marriage Certificate",
        "Death Certificate",
        "Driver's License",
      ],
      required: true,
    },
    issue_date: { type: Date, required: true },
    expiry_date: { type: Date },
    status: {
      type: String,
      enum: ["Issued", "Pending", "Revoked", "Expired"],
      required: true,
    },
    document_file: { type: String },
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
