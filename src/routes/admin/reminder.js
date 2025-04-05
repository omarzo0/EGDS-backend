const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getDocumentsWithStats,
  sendManualReminders,
} = require("../../controller/admin/reminder");

const router = express.Router();

router.get(
  "/documents/with-stats",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  getDocumentsWithStats
);
router.post(
  "/send-reminders",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  sendManualReminders
);

module.exports = router;
