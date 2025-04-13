const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
    stripe_payment_id: {
      type: String,
      required: true,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    amount_paid: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "EGP",
    },
    transaction_reference: {
      type: String,
      required: true,
      unique: true,
    },
    payment_date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentModel =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

module.exports = { PaymentModel };
