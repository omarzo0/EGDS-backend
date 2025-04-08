const express = require("express");
const {
  createDocument,
  deleteDocument,
  getDocumentsByCitizenId
} = require("../../controller/citizen/document.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Delete document
router.get("/documents-get/:id",
  //citizenIsAuth, 
  changeLanguage, 
  getDocumentsByCitizenId);

// Create document
router.post("/documents", 
  // citizenIsAuth, 
  changeLanguage, 
  createDocument);

// Delete document
router.delete("/documents/:id",
   //citizenIsAuth, 
   changeLanguage, 
   deleteDocument);

module.exports = router;
