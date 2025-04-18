const express = require("express");
const {
    getcounts
} = require("../../controller/citizen/counts.js");
const { changeLanguage } = require("../../middleware/language.js");
const { citizenIsAuth } = require("../../middleware/auth.js");

const router = express.Router();

// Get all e-signature papers
router.get("/counts/:id", 
  //citizenIsAuth, 
  changeLanguage, getcounts);

module.exports = router;
