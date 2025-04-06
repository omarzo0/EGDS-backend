const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllDocument,
  getDocumentListById,
  updateDocumentStatus,
  deleteDocument,
  getDocumentCount,
  getDocumentStatusCounts,
} = require("../../controller/admin/document");

const router = express.Router();

router.get(
  "/document-list",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER]),
  getAllDocument
);
router.get(
  "/document-count",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER]),
  getDocumentCount
);
router.get(
  "/document-count-status",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER]),
  getDocumentStatusCounts
);
router.get(
  "/document/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER]),
  getDocumentListById
);

router.put(
  "/update-document/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  updateDocumentStatus
);

router.delete(
  "/delete-document/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  deleteDocument
);

module.exports = router;
