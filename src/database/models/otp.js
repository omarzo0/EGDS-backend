const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  createdAt: { type: Date, expires: "5m", default: Date.now },
});
const OtpModel = mongoose.models.Otp || mongoose.model("Otp", otpSchema);

module.exports = OtpModel;
