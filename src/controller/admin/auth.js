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

    const result = successResponseFormat({
      id: admin._id.toString(),
      accessToken: accessToken,
      accessTokenExpireTime: new Date(
        parseDuration(Config.JWT_ADMIN_SECRET_EXP)
      ),
    });

    res.status(HttpStatus.Ok).json(result);
  } catch (err) {
    const error = errorResponseFormat(err.code, err.message);
    res.status(error.error.code).json(error);
  }
};

// Forgot Password Function
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw ApiError.notFound("Admin not found");
    }

    const resetToken = jwt.sign(
      { id: admin._id.toString() },
      Config.JWT_RESET_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: Config.EMAIL_USER,
        pass: Config.EMAIL_PASS,
      },
    });

    const resetLink = `${Config.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: Config.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
    };

    await transporter.sendMail(mailOptions);

    res
      .status(HttpStatus.Ok)
      .json(successResponseFormat("Reset link sent successfully"));
  } catch (err) {
    const error = errorResponseFormat(err.code, err.message);
    res.status(error.error.code).json(error);
  }
};

// Reset Password Function
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, Config.JWT_RESET_SECRET);
    const admin = await AdminModel.findById(decoded.id);
    if (!admin) {
      throw ApiError.notFound("Invalid or expired token");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    admin.password = hashedPassword;
    await admin.save();

    res
      .status(HttpStatus.Ok)
      .json(successResponseFormat("Password reset successfully"));
  } catch (err) {
    const error = errorResponseFormat(err.code, err.message);
    res.status(error.error.code).json(error);
  }
};

module.exports = { adminLogin, forgotPassword, resetPassword };
