const ApiError = require("../utils/ApiError");
const { verifyToken } = require("../utils/token");
const { Config } = require("../config/index");
const { AdminModel } = require("../database/models/admin");
const { CitizenModel } = require("../database/models/citizen");

async function adminIsAuth(req, res, next) {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throw ApiError.invalidAccessToken();
    }

    const splitHeader = authHeader.split(" ");
    if (splitHeader.length !== 2 || splitHeader[0] !== "Bearer") {
      throw ApiError.invalidAccessToken();
    }

    const adminId = verifyToken(splitHeader[1], Config.JWT_ADMIN_SECRET);

    const admin = await AdminModel.findById(req.adminId.toString()).select(
      "-password"
    );
    if (!admin) {
      throw ApiError.invalidAccessToken();
    }

    req.adminId = adminId.toString();
    req.admin = admin;
    req.language = req.admin.languagePreference || "en";

    next();
  } catch (err) {
    next(err);
  }
}

async function citizenIsAuth(req, res, next) {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      throw ApiError.invalidAccessToken();
    }

    const splitHeader = authHeader.split(" ");
    if (splitHeader.length !== 2 || splitHeader[0] !== "Bearer") {
      throw ApiError.invalidAccessToken();
    }

    const citizenId = verifyToken(splitHeader[1], Config.JWT_CITIZEN_SECRET);

    const citizen = await CitizenModel.findById(
      req.citizenId.toString()
    ).select("-password");
    if (!citizen) {
      throw ApiError.invalidAccessToken();
    }

    req.citizenId = citizenId.toString();
    req.citizen = citizen;
    req.language = req.citizen.languagePreference || "en";

    next();
  } catch (err) {
    next(err);
  }
}

function adminAllowedTo(...roles) {
  return async (req, _, next) => {
    try {
      if (!roles.includes(req.admin.role)) {
        return next(ApiError.unauthorized());
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { adminIsAuth, citizenIsAuth, adminAllowedTo };
