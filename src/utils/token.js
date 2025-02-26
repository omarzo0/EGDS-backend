const jwt = require("jsonwebtoken");
const ApiError = require("../errors/ApiError");

function createToken(payload, key, exp) {
  return jwt.sign(payload, key, {
    expiresIn: exp,
  });
}

function verifyToken(token, key) {
  try {
    return jwt.verify(token, key, {
      ignoreExpiration: false,
    });
  } catch (err) {
    throw ApiError.invalidAccessToken();
  }
}

module.exports = {
  createToken,
  verifyToken,
};
