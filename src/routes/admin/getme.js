const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAdminProfile,
  updateAdminProfile,
} = require("../../controller/admin/getme");

const router = express.Router();

router.get(
  "/profile/:id?",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  getAdminProfile
);

router.put(
  "/profile/:id?",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  updateAdminProfile
);

module.exports = router;
