const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { getAllServices } = require("../../controller/citizen/services");

const router = express.Router();

router.get(
  "/services-list",

  changeLanguage,
  getAllServices
);

module.exports = router;
