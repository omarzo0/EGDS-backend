const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoice_no: { type: String, required: true, unique: true },
    invoice_generated_on: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue", "Cancelled"],
      required: true,
    },
    invoice_paid_on: { type: Date },
  },
  { timestamps: true }
);

const InvoiceModel =
  mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

module.exports = { InvoiceModel };
