const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getFeedback,
  getFeedbackByUser,
} = require("../Controller/feedback");

router.post("/submit", submitFeedback);

router.get("/all", getFeedback);

router.get("/:userId", getFeedbackByUser);

module.exports = router;
