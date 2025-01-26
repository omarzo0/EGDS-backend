const Payment = require("../../database/models/Payment");
const Citizen = require("../../database/models/Citizen");

// Controller for processing payment
exports.processPayment = async (req, res) => {
  const { citizen_id, fee_id, amount, currency, card_token } = req.body;

  try {
    // Validate citizen
    const citizen = await Citizen.findById(citizen_id);
    ``;
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }

    // Create a charge with Stripe
    const charge = await stripe.charges.create({
      amount: Math.round(amount * 100), // Amount in smallest currency unit
      currency,
      source: card_token, // Token from frontend
      description: `Payment for Fee ID: ${fee_id}`,
    });

    // Save payment record
    const payment = new Payment({
      citizen_id,
      fee_id,
      amount_paid: amount,
      currency,
      payment_method: "Credit Card",
      card_details: {
        card_brand: charge.payment_method_details.card.brand,
        last_four_digits: charge.payment_method_details.card.last4,
      },
      payment_status: "Completed",
      transaction_reference: charge.id,
      receipt_url: charge.receipt_url,
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Payment failed",
      error: error.message,
    });
  }
};

// Controller for getting all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("citizen_id", "first_name last_name national_id")
      .populate("fee_id", "fee_name amount");

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

// Controller for getting payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate("citizen_id", "first_name last_name national_id")
      .populate("fee_id", "fee_name amount");

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message,
    });
  }
};
