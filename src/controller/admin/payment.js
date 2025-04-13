const { PaymentModel } = require("../../database/models/Payment");

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentModel.find().populate("citizen_id").populate({
      path: "service_id",
      select: "name description",
    });
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
    const payment = await PaymentModel.findById(req.params.id).populate(
      "citizen_id"
    );

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
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching citizen payments",
      error: error.message,
    });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentsByCitizen,
};
