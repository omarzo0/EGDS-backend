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


const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const citizen = await CitizenModel.findOne({ email });
    if (!citizen) {
      throw ApiError.notFound("Email not registered.");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 3600000; // 1 hour expiry

    citizen.resetPasswordToken = resetToken;
    citizen.resetPasswordExpire = resetTokenExpire;
    await citizen.save();

    // Send reset email
    const resetUrl = `${Config.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      "Password Reset Request",
      `Click the link to reset your password: ${resetUrl}`
    );

    res.status(HttpStatus.Ok).json(successResponseFormat("Reset link sent."));
  } catch (err) {
    const error = errorResponseFormat(err.code, err.message);
    res.status(error.error.code).json(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const citizen = await CitizenModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!citizen) {
      throw ApiError.badRequest("Invalid or expired reset token.");
    }

    citizen.password = await bcrypt.hash(newPassword, 10);
    citizen.resetPasswordToken = undefined;
    citizen.resetPasswordExpire = undefined;
    await citizen.save();

    res
      .status(HttpStatus.Ok)
      .json(successResponseFormat("Password updated successfully."));
  } catch (err) {
    const error = errorResponseFormat(err.code, err.message);
    res.status(error.error.code).json(error);
  }
};

module.exports = {
  login,
  register,
  forgetPassword,
  resetPassword,
};
