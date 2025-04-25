const express = require("express");
const {
  getAllMyDocuments,
  createDigitalDocument,
  deleteDigitalDocument,
} = require("../../controller/citizen/digitalwallet");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

router.get(
  "/digital-document-list/:citizen_id",
  // citizenIsAuth,
  changeLanguage,
  getAllMyDocuments
);

router.post(
  "/digital-document",
  // citizenIsAuth,
  changeLanguage,
  createDigitalDocument
);

router.delete(
  "/delete-document/:document_id",
  // citizenIsAuth,
  changeLanguage,
  deleteDigitalDocument
);

module.exports = router;
