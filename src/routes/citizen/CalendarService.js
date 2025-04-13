const express = require("express");
const { getCurrentMonthHolidays } = require("../../controller/citizen/CalendarService.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Get all documents
router.get("/getHolidays", 
    //citizenIsAuth, 
    changeLanguage, getCurrentMonthHolidays);

module.exports = router;
