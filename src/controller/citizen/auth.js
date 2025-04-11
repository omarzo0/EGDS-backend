const bcrypt = require("bcryptjs");
const { CitizenModel } = require("../../database/models/citizen");
const { HttpStatus, ApiError } = require("../../error");
const { Config } = require("../../config");
const { createToken } = require("../../utils/token");
const {
  parseDuration,
  successResponseFormat,
  errorResponseFormat,
} = require("../../utils/response");
const nodemailer = require("nodemailer");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
const login = async (req, res) => {
  try {
    const body = req.body;
    const { email, password } = body;

    const citizen = await CitizenModel.findOne({ email });
    if (!citizen) {
      throw ApiError.invalidEmailCredentials();
    }

    const validPass = await bcrypt.compare(password, citizen.password);
    if (!validPass) {
      throw ApiError.invalidEmailCredentials();
    }

    const accessToken = createToken(
      { id: citizen._id.toString() },
      Config.JWT_CITIZEN_SECRET,
      Config.JWT_CITIZEN_SECRET_EXP
    );

    const result = successResponseFormat({
      id: citizen._id.toString(),
      accessToken: accessToken,
      accessTokenExpireTime: new Date(
        parseDuration(Config.JWT_CITIZEN_SECRET_EXP)
      ),
    });

    res.status(HttpStatus.Ok).json(result);
  } catch (err) {
    const error = errorResponseFormat(err.code, err.message);
    res.status(error.error.code).json(error);
  }
};

const register = async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      gender,
      national_id,
      address,
      Government,
      phone_number,
      email,
      password,
      marital_status,
    } = req.body;

    const existingCitizen = await CitizenModel.findOne({
      $or: [{ email }, { national_id }],
    });

    if (existingCitizen) {
      throw ApiError.badRequest("Email or National ID is already registered.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const citizen = await CitizenModel.create({
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      gender,
      national_id,
      address,
      Government,
      phone_number,
      email,
      password: hashedPassword,
      marital_status,
    });

    const accessToken = createToken(
      { id: citizen._id.toString() },
      Config.JWT_CITIZEN_SECRET,
      Config.JWT_CITIZEN_SECRET_EXP
    );

    const result = successResponseFormat({
      id: citizen._id.toString(),
      accessToken: accessToken,
      accessTokenExpireTime: new Date(
        parseDuration(Config.JWT_CITIZEN_SECRET_EXP)
      ),
    });

    res.status(HttpStatus.Created).json(result);
  } catch (err) {
    const error = errorResponseFormat(err.code, err.message);
    res.status(error.error.code).json(error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email input
    if (!email) {
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "Email is required",
        },
      });
    }

    const normalizedEmail = email.toLowerCase();
    const citizen = await CitizenModel.findOne({ email: normalizedEmail });

    // Handle case where citizen is not found
    if (!citizen) {
      return res.status(404).json({
        status: "error",
        error: {
          code: 404,
          message: "citizen not found with this email address",
        },
      });
    }

    // Generate and save OTP
    const otp = generateOTP();
    citizen.otp = otp;
    citizen.otpExpiry = Date.now() + 10 * 60 * 1000;
    await citizen.save();

    // Email configuration
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

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log("SMTP connection verified");
    } catch (verifyError) {
      console.error("SMTP connection failed:", verifyError);
      return res.status(503).json({
        status: "error",
        error: {
          code: 503,
          message: "Email service is currently unavailable",
        },
      });
    }

    // Email content
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
        "X-Priority": "1",
      },
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      status: "success",
      data: {
        message: "OTP sent successfully",
      },
    });
  } catch (err) {
    console.error("Forgot password error:", err);

    // Handle specific error cases
    let statusCode = 500;
    let message = "Internal Server Error";

    if (err.code === "ESOCKET" || err.code === "ECONNECTION") {
      statusCode = 503;
      message = "Email service is currently unavailable";
    }

    return res.status(statusCode).json({
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
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "All fields are required",
        },
      });
    }

    const citizen = await CitizenModel.findOne({ email }).select(
      "+otp +otpExpiry +password"
    );
    if (!citizen) {
      return res.status(404).json({
        status: "error",
        error: {
          code: 404,
          message: "citizen not found",
        },
      });
    }

    if (!citizen.otp || citizen.otp !== otp) {
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "Invalid OTP",
        },
      });
    }

    if (Date.now() > citizen.otpExpiry) {
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "OTP has expired",
        },
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    citizen.password = hashedPassword;
    citizen.otp = undefined;
    citizen.otpExpiry = undefined;
    await citizen.save();

    return res.status(200).json({
      status: "success",
      data: {
        message: "Password reset successfully",
      },
    });
  } catch (err) {
    console.error("Password reset error:", err);
    return res.status(500).json({
      status: "error",
      error: {
        code: 500,
        message: "Internal server error",
      },
    });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
};
