const { HttpStatus } = require("../error");
const { getI18Message } = require("./i18n");

function errorResponseFormat(code, message) {
  return {
    status: "error",
    error: {
      code: code || HttpStatus.InternalServerError,
      message: code ? message : getI18Message("somethingWentWrong"),
    },
  };
}

function successResponseFormat(data) {
  return {
    status: "success",
    data: data,
  };
}

function parseDuration(duration) {
  const units = {
    m: 60 * 1000, // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
    y: 365 * 24 * 60 * 60 * 1000, // years (approximate)
  };

  const regex = /^(\d+)([mhdwy])$/;
  const match = duration.match(regex);

  if (!match) {
    throw new ApiError(
      "Invalid format. Use numbers followed by 'm', 'h', 'd', or 'y'.",
      HttpStatus.InternalServerError
    );
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  if (!units[unit]) {
    throw new ApiError(
      "Unsupported time unit. Use 'm', 'h', 'd', or 'y'.",
      HttpStatus.InternalServerError
    );
  }

  return Date.now() + value * units[unit];
}

module.exports = { errorResponseFormat, successResponseFormat, parseDuration };
