const express = require("express");
const router = express.Router();
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllPayments,
  getPaymentById,
  getPaymentsByCitizen,
  updatePaymentStatus,
} = require("../../controller/admin/payment");

router.get(
  "/get-all-payment",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  getAllPayments
);
router.get(
  "/get-all-payment/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  getPaymentById
);
router.get(
  "/get-all-payment-citizen/:citizenId",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  getPaymentsByCitizen
);
router.put(
  "/payment/:id/status",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  updatePaymentStatus
);
module.exports = router;
