const express = require("express");
const { sendSMSNotification } = require("../Controller/notification");

const router = express.Router();

// Route to send SMS notification
router.post("/send", sendSMSNotification);

module.exports = router;
