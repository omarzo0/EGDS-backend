const bcrypt = require("bcryptjs");
const { AdminModel } = require("../../database/models/admin");
const { HttpStatus, ApiError } = require("../../error");
const { Config } = require("../../config");
const { createToken } = require("../../utils/token");
const {
  parseDuration,
  successResponseFormat,
  errorResponseFormat,
} = require("../../utils/response");

const adminLogin = async (req, res) => {
  try {
    const body = req.body;
    const { email, password } = body;

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

module.exports = { adminLogin };
