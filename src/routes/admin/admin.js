const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAdminList,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require("../../controller/admin/admin");

const router = express.Router();

router.get(
  "/admin",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  getAdminList
);
router.post(
  "/admin",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN], createAdmin)
);
router.put(
  "/admin/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN], updateAdmin)
);
router.delete(
  "/admin/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN], deleteAdmin)
);

module.exports = router;
