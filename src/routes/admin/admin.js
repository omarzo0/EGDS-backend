const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../Middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAdminList,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require("../../controller/admin/admin");

const router = express.Router();

router.get(
  "/list",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN]),
  getAdminList
);
router.post(
  "/create",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN], createAdmin)
);
router.put(
  "/:id/update",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN], updateAdmin)
);
router.delete(
  "/:id/delete",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN], deleteAdmin)
);

module.exports = router;
