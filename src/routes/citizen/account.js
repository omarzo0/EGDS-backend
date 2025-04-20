const express = require("express");
const { getAccount, updateMe } = require("../../controller/citizen/account.js");
const { changeLanguage } = require("../../middleware/language.js");
const { citizenIsAuth } = require("../../middleware/auth.js");

const router = express.Router();

// Get all e-signature papers
router.get(
  "/account/:id",
  //citizenIsAuth,
  changeLanguage,
  getAccount
);
router.post(
  "/update-account/:id",
  //citizenIsAuth,
  changeLanguage,
  updateMe
);

module.exports = router;
