const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllPoint,
  getPointListById,
  updatePoint,
  deletePoint,
} = require("../../controller/admin/point");

const router = express.Router();

router.get(
  "/point",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], getAllPoint)
);
router.get(
  "/point/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], getPointListById)
);
router.put(
  "/point/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], updatePoint)
);
router.delete(
  "/point/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], deletePoint)
);

module.exports = router;
