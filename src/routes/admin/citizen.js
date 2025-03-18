const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllCitizen,
  createCitizen,
  updateCitizen,
  deleteCitizen,
} = require("../../controller/admin/citizen");

const router = express.Router();

router.get(
  "/citizen",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], getAllCitizen)
);
router.post(
  "/citizen",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], createCitizen)
);
router.put(
  "/citizen/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], updateCitizen)
);
router.delete(
  "/citizen/:id",
  adminIsAuth,
  changeLanguage,
  adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN], deleteCitizen)
);

module.exports = router;
