const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoice_no: {
      type: String,
      required: true,
      unique: true,
    },
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    issue_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    due_date: {
      type: Date,
      required: true,
    },
    services: [
      {
        service_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        name: { type: String, required: true },
        fees: { type: Number, required: true },
        points: { type: Number, required: true },
        processing_time: { type: String },
      },
    ],
    total_fees: { type: Number, required: true },
    total_points: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue", "Cancelled"],
      default: "Pending",
      required: true,
    },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    payment_date: { type: Date },
  },
  { timestamps: true }
);
const InvoiceModel =
  mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

module.exports = { InvoiceModel };
