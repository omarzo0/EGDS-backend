const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  listChatQuestions,
  addChatQuestion,
  updateChatQuestion,
  deleteChatQuestion,
} = require("../../controller/admin/chat");

const router = express.Router();

router.get(
  "/Chat-List",
  // adminIsAuth,
  changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  listChatQuestions
);

router.post(
  "/create-Q&A",
  // adminIsAuth,
  changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  addChatQuestion
);

router.put(
  "/update-Q&A/:id",
  // adminIsAuth,
  changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  updateChatQuestion
);

router.delete(
  "/delete-Q&A/:id",
  // adminIsAuth,
  changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  deleteChatQuestion
);

module.exports = router;
