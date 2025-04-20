const mongoose = require("mongoose");

const documentApplicationSchema = new mongoose.Schema(
  {
    document_number: { type: String, required: true },
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
    
    preferred_contact_method: {
      type: String,
      enum: ["email", "phone"],
      required: true,
      default: "phone",
    },
    
    approval_date: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Approved", "Rejected"],
      required: true,
      default: "Pending",
    },
    rejection_reason: { type: String },
    amount: { type: Number, required: true },
    issued_by: { type: String },
    issued_date: { type : Date },
    notes:{type: String},
  },
  { timestamps: true }
);

const DocumentApplicationModel =
  mongoose.models.DocumentApplication ||
  mongoose.model("DocumentApplication", documentApplicationSchema);

module.exports = { DocumentApplicationModel };
