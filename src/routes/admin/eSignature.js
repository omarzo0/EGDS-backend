const express = require("express");
const multer = require("multer");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllSignature,
  getSignatureListById,
  handleSignature,
  deleteSignature,
  getSignatureCounts,
} = require("../../controller/admin/eSignature");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get(
  "/signature-list",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER]),
  getAllSignature
);
router.get(
  "/signature-count",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER]),
  getSignatureCounts
);
router.get(
  "/signature-list/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER]),
  getSignatureListById
);
router.put(
  "/signature/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER]),
  handleSignature
);
router.delete(
  "/signature/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER]),
  deleteSignature
);

module.exports = router;
