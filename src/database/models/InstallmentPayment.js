const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema({
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    required: true,
  },
  fee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fee",
    required: true,
  },
  total_amount: {
    type: Number,
    required: true,
  },
  amount_paid: {
    type: Number,
    default: 0,
  },
  remaining_balance: {
    type: Number,
    required: true,
  },
  installments: [
    {
      payment_date: { type: Date, default: Date.now },
      amount_paid: { type: Number },
      transaction_reference: { type: String },
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending",
  },
});

const InstallmentPayment = mongoose.model(
  "InstallmentPayment",
  installmentSchema
);
module.exports = InstallmentPayment;
