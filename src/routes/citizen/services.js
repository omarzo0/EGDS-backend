const express = require("express");
const { adminIsAuth, adminAllowedTo } = require("../../middleware/auth");
const { changeLanguage } = require("../../middleware/language");
const { AdminRole } = require("../../database/models/admin");
const { getAllServices } = require("../../controller/citizen/services");

const router = express.Router();

router.get(
  "/services",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], getAllServices)
);

module.exports = router;
