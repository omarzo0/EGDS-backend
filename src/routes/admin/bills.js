const express = require("express");
const router = express.Router();
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByCitizen,
  updateInvoiceStatus,
} = require("../../controller/admin/bills");

router.get(
  "/get-all-invoices",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  getAllInvoices
);
router.get(
  "/get-all-invoices/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  getInvoiceById
);
router.get(
  "/get-all-invoices-citizen/:citizenId",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  getInvoicesByCitizen
);
router.put(
  "/invoices/:id/status",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  updateInvoiceStatus
);
module.exports = router;
