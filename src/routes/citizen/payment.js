const express = require("express");
const { getPayment, getcitizenPayment } = require("../../controller/citizen/payment.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Get points
router.post("/payment", 
    //citizenIsAuth, 
    changeLanguage, getPayment);

router.post("/payment/:id", 
    //citizenIsAuth, 
    changeLanguage, getcitizenPayment);

module.exports = router;
