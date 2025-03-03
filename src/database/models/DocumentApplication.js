const mongoose = require("mongoose");

const documentApplicationSchema = new mongoose.Schema(
  {
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
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
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      required: true,
    },
    rejection_reason: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
  },
  { timestamps: true }
);

const DepartmentModel =
  mongoose.models.Department || mongoose.model("Department", departmentSchema);
const ServiceModel =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);
const DocumentApplicationModel =
  mongoose.models.DocumentApplication ||
  mongoose.model("DocumentApplication", documentApplicationSchema);

module.exports = { DepartmentModel, ServiceModel, DocumentApplicationModel };
