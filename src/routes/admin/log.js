const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const { getAllLog } = require("../../controller/admin/log");

const router = express.Router();

router.get(
  "/log",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN], getAllLog)
);

module.exports = router;
