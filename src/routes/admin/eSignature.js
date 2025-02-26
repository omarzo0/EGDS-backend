const express = require("express");
const multer = require("multer");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../Middleware/auth");
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
  "/list",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    getAllSignature
  )
);
router.get(
  "/:id/list",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    getSignatureListById
  )
);
router.post(
  "/create",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    createSignature
  ),
  upload.single("document")
);
router.put(
  "/:id/update",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    updateSignature
  )
);
router.delete(
  "/:id/delete",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo(
    [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
    deleteSignature
  )
);

module.exports = router;
