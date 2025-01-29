const express = require("express");
const router = express.Router();
const {
  processPayment,
  getAllPayments,
  getPaymentById,
  processInstallmentPayment,
} = require("../Controller/payment");

router.post("/process", processPayment);
router.post("/installment", processInstallmentPayment);

router.get("/", getAllPayments);

router.get("/:id", getPaymentById);

module.exports = router;
