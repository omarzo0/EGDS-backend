const express = require("express");
const {
  login,
  register,
  forgetPassword,
} = require("../../controller/citizen/auth.js");
const { validateBody } = require("../../middleware/validation.js");
const { citizenLoginSchema } = require("../../validation/citizen/auth.js");

const router = express.Router();

// Login
router.post("/login", validateBody(citizenLoginSchema), login);

// Register
router.post("/register", register);

// Forget Password
router.post("/forget-password", forgetPassword);

module.exports = router;
