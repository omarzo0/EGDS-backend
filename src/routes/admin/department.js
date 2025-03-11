const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../../controller/admin/department");

const router = express.Router();

router.get(
  "/department",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], getAllDepartment)
);
router.post(
  "/department",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], createDepartment)
);
router.put(
  "/department/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], updateDepartment)
);
router.delete(
  "/department/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], deleteDepartment)
);

module.exports = router;
