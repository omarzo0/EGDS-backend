const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllDigitalDocument,
  getDigitalDocumentById,
  UpdateDigitalDocumentStatus,
  deleteDigitalDocument,
} = require("../../controller/admin/digitalwallet");

const router = express.Router();

router.get(
  "/digital-document",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
    getAllDigitalDocument
  )
);
router.get(
  "/digital-document/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
    getDigitalDocumentById
  )
);
router.put(
  "/digital-document/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
    UpdateDigitalDocumentStatus
  )
);
router.delete(
  "/digital-document/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
    deleteDigitalDocument
  )
);

module.exports = router;
