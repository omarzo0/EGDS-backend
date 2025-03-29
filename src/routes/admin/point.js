const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllServices,
  updateServicePoints,
  deleteService,
} = require("../../controller/admin/point");

const router = express.Router();

router.get(
  "/get-services",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  getAllServices
);

router.put(
  "/update-point/:id/points",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  updateServicePoints
);
router.delete(
  "/delete-point/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  deleteService
);

module.exports = router;
