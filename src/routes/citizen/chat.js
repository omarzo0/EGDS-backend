const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const { listChatQuestions } = require("../../controller/citizen/chat");

const router = express.Router();

router.get(
  "/Chat-List",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  listChatQuestions
);

module.exports = router;
