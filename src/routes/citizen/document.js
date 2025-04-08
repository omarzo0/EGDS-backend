const express = require("express");
const {
  createDocument,
  deleteDocument,
} = require("../../controller/citizen/document.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Create document
router.post("/documents", 
  // citizenIsAuth, 
  changeLanguage, 
  createDocument);

// Delete document
router.delete("/documents/:id", citizenIsAuth, changeLanguage, deleteDocument);

module.exports = router;
