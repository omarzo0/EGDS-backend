const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../Middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllPoint,
  getPointListById,
  updatePoint,
  deletePoint,
} = require("../../controller/admin/point");

const router = express.Router();

router.get(
  "/list",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], getAllPoint)
);
router.get(
  "/:id/list",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], getPointListById)
);
router.put(
  "/:id/update",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], updatePoint)
);
router.delete(
  "/:id/delete",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], deletePoint)
);

module.exports = router;
