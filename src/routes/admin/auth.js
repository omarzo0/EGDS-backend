const express = require("express");
const {
  adminLogin,
  forgotPassword,
  resetPassword,
} = require("../../controller/admin/auth");
const { validateBody } = require("../../middleware/validation");
const {
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../../validation/admin/auth");

const router = express.Router();

router.post("/login", validateBody(adminLoginSchema), adminLogin);

router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  resetPassword
);

module.exports = router;
