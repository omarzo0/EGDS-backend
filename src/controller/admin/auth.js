const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { AdminModel } = require("../../database/models/admin");
const { HttpStatus, ApiError } = require("../../error");
const { Config } = require("../../config");
const { createToken } = require("../../utils/token");
const {
  parseDuration,
  successResponseFormat,
  errorResponseFormat,
} = require("../../utils/response");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw ApiError.invalidEmailCredentials();
    }

    const validPass = await bcrypt.compare(password, admin.password);
    if (!validPass) {
      console.log("Password comparison failed");
      throw ApiError.invalidEmailCredentials();
    }

    const accessToken = createToken(
      { id: admin._id.toString() },
      Config.JWT_ADMIN_SECRET,
      Config.JWT_ADMIN_SECRET_EXP
    );

    res.status(HttpStatus.Ok).json(
      successResponseFormat({
        id: admin._id.toString(),
        accessToken: accessToken,
        accessTokenExpireTime: new Date(
          parseDuration(Config.JWT_ADMIN_SECRET_EXP)
        ),
      })
    );
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(err.code || HttpStatus.InternalServerError)
      .json(errorResponseFormat(err.code, err.message));
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase();
    console.log(`Password reset requested for: ${email}`);

    const admin = await AdminModel.findOne({ email: normalizedEmail });
    if (!admin) {
      console.log("Admin not found for email:", email);
      throw ApiError.notFound("Admin not found");
    }

    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpiry = Date.now() + 10 * 60 * 1000;
    await admin.save();

    console.log("OTP generated and saved for admin:", admin._id);

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: { user: "88cdcc001@smtp-brevo.com", pass: "yNK7Z6f81w2XsDjm" },
    });

    const mailOptions = {
      from: '"E-Government Documentation System" <omarkhaled202080@gmail.com>',
      to: normalizedEmail,
      subject: "Password Reset OTP - E-Government Documentation System",
      text: `Your OTP for password reset is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p>You requested a password reset for your E-Government Documentation System account.</p>
          <p style="font-size: 18px; font-weight: bold;">Your OTP code is: <span style="color: #e74c3c;">${otp}</span></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #7f8c8d;">E-Government Documentation System Team</p>
        </div>
      `,
      headers: {
        "X-Mailer": "Node.js",
        "X-Priority": "1", // High priority
      },
    };

    await transporter.sendMail(mailOptions);
    res.status(HttpStatus.Ok).json(successResponseFormat("OTP sent"));
  } catch (err) {
    console.error("Email send error:", err);
    res
      .status(err.code || 500)
      .json(errorResponseFormat(err.code, "Failed to send OTP."));
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new ApiError(400, "All fields are required");
    }

    const admin = await AdminModel.findOne({ email }).select(
      "+otp +otpExpiry +password"
    );
    if (!admin) {
      throw new ApiError(404, "Admin not found");
    }

    if (!admin.otp || admin.otp !== otp || Date.now() > admin.otpExpiry) {
      throw new ApiError(400, "Invalid or expired OTP");
    }

    // Set the plain text password - the pre-save hook will hash it
    admin.password = newPassword;
    admin.otp = undefined;
    admin.otpExpiry = undefined;

    await admin.save();

    res.status(200).json(successResponseFormat("Password reset successfully"));
  } catch (err) {
    console.error("Password reset error:", err);
    res
      .status(err.code || 500)
      .json(errorResponseFormat(err.code, err.message));
  }
};

module.exports = { adminLogin, forgotPassword, resetPassword };
