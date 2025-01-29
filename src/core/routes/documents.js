const express = require("express");
const {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocumentById,
  deleteDocumentById,
} = require("../Controller/documents");
const upload = require("../../middleware/uploadConfig");

const router = express.Router();

router.post("/", upload.single("document_file"), createDocument);
router.get("/", getAllDocuments);
router.get("/:id", getDocumentById);
router.put("/:id", updateDocumentById);
router.delete("/:id", deleteDocumentById);

module.exports = router;
