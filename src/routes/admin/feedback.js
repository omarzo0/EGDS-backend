const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllFeedback,
  updateFeedbackStatus,
} = require("../../controller/admin/feedback");

const router = express.Router();

router.get(
  "/feedback",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], getAllFeedback)
);
router.put(
  "/:feedbackId/status",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], updateFeedbackStatus)
);

module.exports = router;
