const express = require("express");
const { adminLogin } = require("../../controller/admin/auth");
const { validateBody } = require("../../middleware/validation");
const { adminLoginSchema } = require("../../validation/admin/auth");

const router = express.Router();

router.post("/login", validateBody(adminLoginSchema), adminLogin);

module.exports = router;
