const express = require("express");
const router = express.Router();
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  sendNotificationToCitizen,
  sendNotificationToAllCitizens,
  sendNotificationToAdminsByType,
  getNotificationsForAdmin,
  sendNotificationToAdmin,
  sendNotificationToAllAdmins,
} = require("../../controller/admin/notification");

// Create new notification
router.post(
  "/notifications/citizen/:citizenId",
  //   adminIsAuth,
  //   changeLanguage,
  //   adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  sendNotificationToCitizen
);
router.post(
  "/citizen-notifications",
  //   adminIsAuth,
  //   changeLanguage,
  //   adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  sendNotificationToAllCitizens
);
router.post(
  "/notifications/admins",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  sendNotificationToAdminsByType
);
router.get(
  "/notifications/admin/:adminId",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  getNotificationsForAdmin
);
router.post(
  "/send/:adminId",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  sendNotificationToAdmin
);
router.post(
  "/notifications/admins/all",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  sendNotificationToAllAdmins
);
module.exports = router;
