const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  uploadDocument,
  uploadSignedDocument,
  getDocument,
} = require("../Controller/eSignature");

router.post("/upload", upload.single("uploaded_document"), uploadDocument);
router.post(
  "/upload-signed",
  upload.single("signed_document"),
  uploadSignedDocument
);
router.get("/:documentId", getDocument);

module.exports = router;
