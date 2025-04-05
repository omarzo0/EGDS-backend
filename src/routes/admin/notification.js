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
  countUnreadNotificationsForAdmin,
  markAllNotificationsRead,
} = require("../../controller/admin/notification");

// Create new notification done
router.post(
  "/notifications/citizen/:citizenId",
  //   adminIsAuth,
  //   changeLanguage,
  //   adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  sendNotificationToCitizen
);
//done
router.post(
  "/citizen-notifications",
  //   adminIsAuth,
  //   changeLanguage,
  //   adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  sendNotificationToAllCitizens
  // done
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
router.get(
  "/count/:adminId",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  countUnreadNotificationsForAdmin
);
router.put(
  "/notifications/mark-all-read/:adminId",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  markAllNotificationsRead
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
