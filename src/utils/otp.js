const crypto = require("crypto");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

const verifyOTP = (otp, hashedOTP) => {
  return hashOTP(otp) === hashedOTP;
};

module.exports = { generateOTP, hashOTP, verifyOTP };
