const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    required: true,
  },
  fee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Fee", required: true },
  payment_date: { type: Date, required: true },
  amount_paid: { type: Number, required: true },
  payment_method: {
    type: String,
    enum: ["Cash", "Credit Card", "Online Transfer"],
    required: true,
  },
  transaction_reference: { type: String },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
