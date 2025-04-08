const express = require("express");
const { getAllDepartment } = require("../../controller/citizen/department");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Get all documents
router.get(
  "/department-list",
  // citizenIsAuth,
  //   changeLanguage,
  getAllDepartment
);

module.exports = router;
