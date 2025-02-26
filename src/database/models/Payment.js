const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
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
    payment_date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    amount_paid: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "INR", "JPY", "AED"],
      default: "USD",
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    payment_method: {
      type: String,
      enum: ["Cash", "Credit Card", "Online Transfer", "Mobile Payment"],
      required: true,
    },
    card_details: {
      cardholder_name: { type: String }, // Name on the card
      card_brand: { type: String }, // Visa, MasterCard, etc.
      last_four_digits: { type: String, match: /^\d{4}$/ }, // Last 4 digits of the card
      expiry_date: {
        type: String,
        match: /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/,
      }, // MM/YY format
      token: { type: String }, // Tokenized reference from payment gateway (if applicable)
    },
    payment_status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    transaction_reference: {
      type: String,
      unique: true,
    },
    receipt_url: {
      type: String,
    },
    failure_reason: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentModel = mongoose.model("Payment", paymentSchema);

module.exports = { PaymentModel };
