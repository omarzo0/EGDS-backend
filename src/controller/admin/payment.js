const { PaymentModel } = require("../../database/models/Payment");
const { InvoiceModel } = require("../../database/models/bills");

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentModel.find()
      .populate("citizen_id")
      .populate("fee_id");
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await PaymentModel.findById(req.params.id)
      .populate("citizen_id")
      .populate("fee_id");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payment",
      error: error.message,
    });
  }
};

// Get payments by citizen ID
const getPaymentsByCitizen = async (req, res) => {
  try {
    const payments = await PaymentModel.find({
      citizen_id: req.params.citizenId,
    }).populate("fee_id");

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching citizen payments",
      error: error.message,
    });
  }
};

// Update payment status (for refunds, etc.)
const updatePaymentStatus = async (req, res) => {
  try {
    const { status, failure_reason } = req.body;

    const payment = await PaymentModel.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.payment_status = status;
    if (failure_reason) payment.failure_reason = failure_reason;

    const updatedPayment = await payment.save();

    if (status === "Refunded") {
      await InvoiceModel.updateOne(
        { payment_id: payment._id },
        { status: "Cancelled" }
      );
    }

    res.status(200).json({
      message: "Payment status updated",
      payment: updatedPayment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating payment status",
      error: error.message,
    });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentsByCitizen,
  updatePaymentStatus,
};
