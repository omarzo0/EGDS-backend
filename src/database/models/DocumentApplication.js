const mongoose = require("mongoose");

const documentApplicationSchema = new mongoose.Schema(
  {
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true, // Indexing for performance
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    id_number: { type: String },
    preferred_contact_method: {
      type: String,
      enum: ["Email", "Phone"],
      required: true,
    },
    application_date: { type: Date, default: Date.now },
    approval_date: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      required: true,
      default: "Pending",
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
