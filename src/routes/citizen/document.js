const express = require("express");
const {
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} = require("../../controller/citizen/document.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Get all documents
router.get("/documents", citizenIsAuth, changeLanguage, getAllDocuments);

// Create document
router.post("/documents", citizenIsAuth, changeLanguage, createDocument);

// Update document
router.put("/documents/:id", citizenIsAuth, changeLanguage, updateDocument);

// Delete document
router.delete("/documents/:id", citizenIsAuth, changeLanguage, deleteDocument);

module.exports = router;
