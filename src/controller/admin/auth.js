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

    const admin = await AdminModel.findOne({ email: normalizedEmail });
    if (!admin) {
      throw ApiError.notFound("Admin not found");
    }

    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpiry = Date.now() + 10 * 60 * 1000;
    await admin.save();

    const transporter = nodemailer.createTransport({
      host: Config.EMAIL_HOST,
      port: Config.EMAIL_PORT,
      secure: false,
      auth: {
        user: Config.EMAIL_USER,
        pass: Config.EMAIL_PASSWORD,
      },
      connectionTimeout: 5000,
      socketTimeout: 5000,
    });

    // Verify connection
    try {
      await transporter.verify();
      console.log("SMTP connection verified");
    } catch (verifyError) {
      console.error("SMTP connection failed:", verifyError);
      throw new ApiError(503, "Email service is currently unavailable");
    }

    const mailOptions = {
      from: `"${Config.EMAIL_FROM_NAME}" <${Config.EMAIL_FROM_ADDRESS}>`,
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
    res.status(200).json(successResponseFormat("OTP sent successfully"));
  } catch (err) {
    console.error("Forgot password error:", err);

    // Handle different error cases
    let statusCode = err.code || 500;
    let message = err.message || "Internal Server Error";

    if (err.code === "ESOCKET" || err.code === "ECONNECTION") {
      statusCode = 503;
      message = "Email service is currently unavailable";
    }

    res.status(statusCode).json({
      status: "error",
      error: {
        code: statusCode,
        message: message,
      },
    });
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
