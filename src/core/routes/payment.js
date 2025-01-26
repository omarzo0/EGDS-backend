const express = require("express");
const router = express.Router();
const {
  processPayment,
  getAllPayments,
  getPaymentById,
} = require("../Controller/payment");

router.post("/process", processPayment);

router.get("/", getAllPayments);

router.get("/:id", getPaymentById);

module.exports = router;
