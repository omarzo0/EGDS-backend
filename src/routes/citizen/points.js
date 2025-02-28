const express = require("express");
const { getPoints } = require("../../controller/citizen/point.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Get points
router.get("/points", citizenIsAuth, changeLanguage, getPoints);

module.exports = router;
