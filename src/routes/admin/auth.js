const express = require("express");
const { adminLogin } = require("../../controller/admin/auth");

const router = express.Router();

router.post("/login", adminLogin);

module.exports = router;
