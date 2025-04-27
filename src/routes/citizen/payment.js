const express = require("express");
const {
  getPayment,
  getcitizenPayment,
  paymentOTP,
} = require("../../controller/citizen/payment.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Get points
router.post(
  "/confirmPayment/:document_id",
  //citizenIsAuth,
  changeLanguage,
  paymentOTP
);

// Get points
router.post(
  "/payment/:document_id",
  //citizenIsAuth,
  changeLanguage,
  getPayment
);

router.get(
  "/payment-citizen/:id",
  //citizenIsAuth,
  changeLanguage,
  getcitizenPayment
);

module.exports = router;
