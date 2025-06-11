const bcrypt = require("bcryptjs");
const { CitizenModel } = require("../../database/models/citizen");
const { registerModel } = require("../../database/models/register");

const { HttpStatus, ApiError } = require("../../error");
const { Config } = require("../../config");
const { createToken } = require("../../utils/token");
const {
  parseDuration,
  successResponseFormat,
  errorResponseFormat,
} = require("../../utils/response");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


const login = async (req, res) => {
  try {
    const { national_id, password } = req.body;

    // Validate input
    if (!national_id || !password) {
      throw new ApiError(
        HttpStatus.BadRequest,
        "National ID and password are required"
      );
    }

    // Validate encryption key exists
    if (!process.env.ENCRYPTION_KEY) {
      throw new ApiError(
        HttpStatus.InternalServerError,
        "Server configuration error"
      );
    }

    // Decryption function
    const decrypt = (text) => {
      try {
        if (!text || typeof text !== "string") {
          throw new Error("Invalid encrypted text");
        }

        const parts = text.split(":");
        if (parts.length !== 2) {
          throw new Error("Invalid encrypted text format");
        }

        const [ivHex, encryptedHex] = parts;
        const iv = Buffer.from(ivHex, "hex");
        const encrypted = Buffer.from(encryptedHex, "hex");
        const decipher = crypto.createDecipheriv(
          "aes-256-cbc",
          Buffer.from(process.env.ENCRYPTION_KEY),
          iv
        );

        let decrypted = decipher.update(encrypted, null, "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
      } catch (err) {
        console.error("Decryption failed:", err);
        throw new ApiError(HttpStatus.BadRequest, "Invalid national ID format");
      }
    };

    // Get all register records to compare decrypted national_ids
    const registers = await registerModel
      .find()
      .select("+password")
      .populate("citizen_id");

    // Find matching register by comparing decrypted national_ids
    let matchedRegister = null;
    let matchedCitizen = null;

    for (const register of registers) {
      try {
        // Skip if no national_id or invalid format
        if (!register.national_id || typeof register.national_id !== "string") {
          console.warn(`Register ${register._id} has invalid national_id`);
          continue;
        }

        const decryptedId = decrypt(register.national_id);
        if (decryptedId === national_id.trim()) {
          matchedRegister = register;
          matchedCitizen = register.citizen_id;
          break;
        }
      } catch (decryptErr) {
        console.error(
          `Decryption failed for register ${register._id}:`,
          decryptErr.message
        );
        continue;
      }
    }

    // Generic error message for security
    const invalidCredentialsMsg = "Invalid national ID or password";
    
    if (!matchedRegister || !matchedCitizen) {
      throw new ApiError(HttpStatus.Unauthorized, invalidCredentialsMsg);
    }

    // Verify password
    const isPasswordValid = await matchedRegister.matchPassword(password);
    if (!isPasswordValid) {
      throw new ApiError(HttpStatus.Unauthorized, invalidCredentialsMsg);
    }

    // Generate token
    const accessToken = createToken(
      {
        id: matchedCitizen._id.toString(),
        national_id: national_id, // Using the plain national_id here
      },
      Config.JWT_CITIZEN_SECRET,
      Config.JWT_CITIZEN_SECRET_EXP
    );

    const result = successResponseFormat({
      id: matchedCitizen._id.toString(),
      accessToken: accessToken,
      accessTokenExpireTime: new Date(
        Date.now() + parseDuration(Config.JWT_CITIZEN_SECRET_EXP)
      ),
    });

    return res.status(HttpStatus.Ok).json(result);
  } catch (err) {
    console.error("Login error:", err);

    // Handle specific error cases
    let statusCode = err.statusCode || HttpStatus.InternalServerError;
    let message = err.message || "Something went wrong";

    // Override message for 401 errors
    if (statusCode === HttpStatus.Unauthorized) {
      message = "Invalid national ID or password";
    }

    return res.status(statusCode).json({
      status: "error",
      error: { code: statusCode, message },
    });
  }
};


const register = async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      national_id,
      phone_number,
      email,
      password
    } = req.body;

    // Validate required fields
    if (!national_id || !password || !email) {
      throw ApiError.badRequest("National ID, email and password are required");
    }

    // Validate encryption key exists
    if (!process.env.ENCRYPTION_KEY) {
      throw ApiError.serverError(
        "Server configuration error - missing encryption key"
      );
    }

    // Check for existing citizen first
    const existingCitizen = await CitizenModel.findOne({
      $or: [{ email }, { national_id }],
    });

    if (existingCitizen) {
      throw ApiError.badRequest("Email or National ID is already registered.");
    }

    // Encryption function
    const encrypt = (text) => {
      try {
        if (!text || typeof text !== "string") {
          throw new Error("Invalid text for encryption");
        }
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
          "aes-256-cbc",
          Buffer.from(process.env.ENCRYPTION_KEY),
          iv
        );
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        return `${iv.toString("hex")}:${encrypted}`;
      } catch (err) {
        console.error("Encryption failed:", err);
        throw ApiError.serverError("Failed to encrypt data");
      }
    };

    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedNationalId = encrypt(national_id);

    // Create citizen record (plaintext)
    const citizen = await CitizenModel.create({
      first_name,
      middle_name,
      last_name,
      national_id, // Plaintext
      phone_number,
      email,
    });

    // Create register record (encrypted)
    await registerModel.create({
      citizen_id: citizen._id,
      national_id: encryptedNationalId,
      password: hashedPassword,
    });

    // Generate token
    const accessToken = createToken(
      { id: citizen._id.toString() },
      Config.JWT_CITIZEN_SECRET,
      Config.JWT_CITIZEN_SECRET_EXP
    );

    const result = successResponseFormat({
      id: citizen._id.toString(),
      accessToken: accessToken,
      accessTokenExpireTime: new Date(
        Date.now() + parseDuration(Config.JWT_CITIZEN_SECRET_EXP)
      ),
    });

    return res.status(HttpStatus.Created).json(result);
  } catch (err) {
    console.error("Registration error:", err);

    // Handle specific error cases
    let statusCode = HttpStatus.InternalServerError;
    let message = "Something went wrong";

    if (err instanceof ApiError) {
      statusCode = err.code;
      message = err.message;
    } else if (err.name === "ValidationError") {
      statusCode = HttpStatus.BadRequest;
      message = err.message;
    } else if (err.code === 11000) {
      // MongoDB duplicate key
      statusCode = HttpStatus.BadRequest;
      message = "User already exists";
    }

    return res.status(statusCode).json({
      status: "error",
      error: { code: statusCode, message },
    });
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
    const citizen = await CitizenModel.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });
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
