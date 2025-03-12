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

    const admin = await CitizenModel.findOne({ email });
    if (!admin) {
      throw ApiError.invalidEmailCredentials();
    }

    const validPass = await bcrypt.compare(password, admin.password);
    if (!validPass) {
      throw ApiError.invalidEmailCredentials();
    }

    const accessToken = createToken(
      { id: admin._id.toString() },
      Config.JWT_CITIZEN_SECRET,
      Config.JWT_CITIZEN_SECRET_EXP
    );

    const result = successResponseFormat({
      id: admin._id.toString(),
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

const register = async (req, res) => {};

const forgetPassword = async (req, res) => {};

module.exports = {
  login,
  register,
  forgetPassword,
};
