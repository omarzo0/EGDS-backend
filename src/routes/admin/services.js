const express = require("express");
const { adminIsAuth, adminAllowedTo } = require("../../middleware/auth");
const { changeLanguage } = require("../../middleware/language");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllServices,
  createService,
  updateService,
  deleteService,
  getServiceCount,
  getMostBookedServicesThisMonth,
} = require("../../controller/admin/services");

const router = express.Router();

router.get(
  "/services-list",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  getAllServices
);
router.get(
  "/most-services-count",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  getMostBookedServicesThisMonth
);
router.get(
  "/services-count",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  getServiceCount
);
router.post(
  "/create-services",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  createService
);
router.put(
  "/update-services/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  updateService
);
router.delete(
  "/delete-services/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  deleteService
);

module.exports = router;
