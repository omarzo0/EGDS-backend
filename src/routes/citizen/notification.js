const express = require("express");
const {
  getCitizenNotifications,
} = require("../../controller/citizen/notification");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Get feedback
router.get(
  "/Notification",
  citizenIsAuth,
  // changeLanguage,
  getCitizenNotifications
);

module.exports = router;
