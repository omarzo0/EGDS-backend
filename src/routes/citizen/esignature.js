const express = require("express");
const {
  getAllEpapers,
  createEpaper,
  deleteEpaper,
  getAvailableESignServices,
  getESignServicesByDepartment,
} = require("../../controller/citizen/esignature.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Get all e-signature papers
router.get(
  "/esignature/:id",
  //citizenIsAuth,
  changeLanguage,
  getAllEpapers
);
router.get(
  "/esignature-services",
  //citizenIsAuth,
  changeLanguage,
  getAvailableESignServices
);
router.get(
  "/esignature-services/:department_id",
  changeLanguage,
  getESignServicesByDepartment
);
// Create e-signature paper
router.post(
  "/esignature",
  //citizenIsAuth,
  changeLanguage,
  createEpaper
);

// Delete e-signature paper
router.delete(
  "/esignature/:id",
  //citizenIsAuth,
  changeLanguage,
  deleteEpaper
);

module.exports = router;
