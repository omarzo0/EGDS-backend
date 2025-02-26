const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../Middleware/auth");
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
  "/list",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    getAllDocument
  )
);
router.get(
  "/:id/list",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    getDocumentListById
  )
);
router.post(
  "/create",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], createDocument)
);
router.put(
  "/update",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], updateAllDocument)
);
router.put(
  "/:id/update",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    updateDocument
  )
);
router.delete(
  "/:id/delete",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], deleteDocument)
);

module.exports = router;
