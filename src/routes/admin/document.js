const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllDocument,
  getDocumentListById,
  createDocument,
  updateAllDocument,
  updateDocument,
  deleteDocument,
} = require("../../controller/admin/document");

const router = express.Router();

router.get(
  "/document",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    getAllDocument
  )
);
router.get(
  "/document/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    getDocumentListById
  )
);
router.post(
  "/document",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], createDocument)
);
router.put(
  "/document",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], updateAllDocument)
);
router.put(
  "/document/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    updateDocument
  )
);
router.delete(
  "/document/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], deleteDocument)
);

module.exports = router;
