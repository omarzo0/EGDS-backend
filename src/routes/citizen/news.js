const express = require("express");
const { getEgyptianNews } = require("../../controller/citizen/news.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Get all documents
router.get("/getnews", 
    //citizenIsAuth, 
    changeLanguage, getEgyptianNews);

module.exports = router;
