const express = require("express");
const router = express.Router();
const { getChatQuestions } = require("../../controller/citizen/chat");

router.get("/", getChatQuestions);

module.exports = router;
