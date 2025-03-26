const express = require("express");
const {
  getFeedback,
  createFeedback,
} = require("../../controller/citizen/feedback.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Create feedback
router.post("/feedback", citizenIsAuth, changeLanguage, createFeedback);

module.exports = router;
