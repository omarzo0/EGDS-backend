const express = require("express");
const {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocumentById,
  deleteDocumentById,
} = require("../Controller/documents");

const router = express.Router();

// Define routes
router.post("/", createDocument);
router.get("/", getAllDocuments);
router.get("/:id", getDocumentById);
router.put("/:id", updateDocumentById);
router.delete("/:id", deleteDocumentById);

module.exports = router;
