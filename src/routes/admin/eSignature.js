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
  downloadEpaper,
} = require("../../controller/admin/eSignature");

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the directory where uploaded files will be stored
    // Make sure this directory exists or create it programmatically
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Define how the file will be named
    // You might want to add a timestamp to prevent name collisions
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
router.get(
  "/signature-list",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER]),
  getAllSignature
);
router.get(
  "/esignature_download/:signed_id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER]),
  downloadEpaper
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
