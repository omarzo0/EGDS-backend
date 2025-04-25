const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true
    },
    stripe_payment_id: {
      type: String,
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    document_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentApplication",
    },
    amount_paid: {
      type: Number,
    },
    paymentMethodId: {
      type: String 
    },
    currency: {
      type: String,
      default: "EGP",
    },
    invoice_number: {
      type: String,
    },
    otp: {
      type: String,
      required: true,
    },
    otpSecret: {  // Add this field to store the secret
      type: String,
      required: true
    },
    otpExpiry: {
      type: Date,
      required: true,
    },
    transaction_reference: {  // Add this field
      type: String,
      unique: true,
      required: true
    },
    status: {  // Add status tracking
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    payment_date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentModel =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

module.exports = { PaymentModel };
