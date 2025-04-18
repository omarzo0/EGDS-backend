const express = require("express");
const {
    getAccount
} = require("../../controller/citizen/account.js");
const { changeLanguage } = require("../../middleware/language.js");
const { citizenIsAuth } = require("../../middleware/auth.js");

const router = express.Router();

// Get all e-signature papers
router.get("/account/:id", 
  //citizenIsAuth, 
  changeLanguage, getAccount);

module.exports = router;
