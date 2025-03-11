const express = require("express");
const {
  getAllDigitalDocument,
  createDigitalDocument,
  deleteDigitalDocument,
} = require("../../controller/citizen/digitalwallet");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

router.get(
  "/digital-document",
  citizenIsAuth,
  changeLanguage,
  getAllDigitalDocument
);

router.post(
  "/digital-document",
  citizenIsAuth,
  changeLanguage,
  createDigitalDocument
);

router.delete(
  "/digital-document/:id",
  citizenIsAuth,
  changeLanguage,
  deleteDigitalDocument
);

module.exports = router;
