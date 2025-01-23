const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
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
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
});

const Fee = mongoose.model("Fee", feeSchema);

module.exports = Fee;
