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
const { generateOTP, verifyOTP } = require("../../utils/otp");

// Admin Login Function
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw ApiError.invalidEmailCredentials();
    }

    const validPass = await bcrypt.compare(password, admin.password);
    if (!validPass) {
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
    res
      .status(err.code || HttpStatus.InternalServerError)
      .json(errorResponseFormat(err.code, err.message));
  }
};

// Forgot Password Function with OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw ApiError.notFound("Admin not found");
    }

    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await admin.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: Config.EMAIL_USER,
        pass: Config.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: Config.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(HttpStatus.Ok)
      .json(successResponseFormat("OTP sent successfully"));
  } catch (err) {
    res
      .status(err.code || HttpStatus.InternalServerError)
      .json(errorResponseFormat(err.code, err.message));
  }
};

// Reset Password Function with OTP verification
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw ApiError.notFound("Admin not found");
    }

    if (!verifyOTP(admin.otp, otp, admin.otpExpiry)) {
      throw ApiError.badRequest("Invalid or expired OTP");
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();

    res
      .status(HttpStatus.Ok)
      .json(successResponseFormat("Password reset successfully"));
  } catch (err) {
    res
      .status(err.code || HttpStatus.InternalServerError)
      .json(errorResponseFormat(err.code, err.message));
  }
};

module.exports = { adminLogin, forgotPassword, resetPassword };
