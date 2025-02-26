const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../Middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllCitizen,
  createCitizen,
  updateCitizen,
  deleteCitizen,
} = require("../../controller/admin/citizen");

const router = express.Router();

router.get(
  "/list",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], getAllCitizen)
);
router.post(
  "/create",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], createCitizen)
);
router.put(
  "/:id/update",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], updateCitizen)
);
router.delete(
  "/:id/delete",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], deleteCitizen)
);

module.exports = router;
