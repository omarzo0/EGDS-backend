const express = require("express");
const router = express.Router();
const logController = require("../Controller/logs");

// Route to create a log entry
router.post("/create", logController.createLog);

// Route to fetch all logs (admin only)
router.get("/logs", logController.getLogs);

module.exports = router;
