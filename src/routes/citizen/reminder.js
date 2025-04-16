const express = require("express");
const {
    getDocumentsWithStats
} = require("../../controller/citizen/reminder.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Get all e-signature papers
router.get("/reminder", 
  //citizenIsAuth, 
  changeLanguage, getDocumentsWithStats);

module.exports = router;
