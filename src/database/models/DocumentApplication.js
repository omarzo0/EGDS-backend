const mongoose = require("mongoose");

const documentApplicationSchema = new mongoose.Schema(
  {
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
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
    application_date: { type: Date, required: true },
    approval_date: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      required: true,
    },
    rejection_reason: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  { timestamps: true }
);

const DocumentApplicationModel =
  mongoose.models.DocumentApplication ||
  mongoose.model("DocumentApplication", documentApplicationSchema);

module.exports = { DocumentApplicationModel };
