const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentCount,
} = require("../../controller/admin/department");

const router = express.Router();

router.get(
  "/department-list",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  getAllDepartment
);
router.get(
  "/department-count",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  getDepartmentCount
);
router.post(
  "/create-department",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  createDepartment
);
router.put(
  "/update-department/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  updateDepartment
);
router.delete(
  "/delete-department/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  deleteDepartment
);

module.exports = router;
