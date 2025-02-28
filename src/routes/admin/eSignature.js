const express = require("express");
const multer = require("multer");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllSignature,
  getSignatureListById,
  createSignature,
  updateSignature,
  deleteSignature,
} = require("../../controller/admin/eSignature");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get(
  "/signature",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    getAllSignature
  )
);
router.get(
  "/signature/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    getSignatureListById
  )
);
router.post(
  "/signature",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    createSignature
  ),
  upload.single("document")
);
router.put(
  "/signature/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    updateSignature
  )
);
router.delete(
  "/signature/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    deleteSignature
  )
);

module.exports = router;
