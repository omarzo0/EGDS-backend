const express = require("express");
const {
  getFeedbackByCitizenId,
  createFeedback,
} = require("../../controller/citizen/feedback.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Create feedback
router.post(
  "/feedback",
  //citizenIsAuth,
  changeLanguage,
  createFeedback
);
router.get(
  "/feedback/:citizenId",
  //citizenIsAuth,
  changeLanguage,
  getFeedbackByCitizenId
);
module.exports = router;
