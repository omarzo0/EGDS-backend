const Payment = require("../database/models/Payment");
const Citizen = require("../database/models/Citizen");
const InstallmentPayment = require("../database/models/InstallmentPayment");
const stripe = require("stripe");
const GreenPoint = require("../database/models/point");

// Process Full Payment
exports.processPayment = async (req, res) => {
  const { citizen_id, fee_id, amount, currency, card_token, isPaperless } =
    req.body;

  try {
    const citizen = await validateCitizen(citizen_id);
    if (!citizen)
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });

    // Stripe Payment Processing
    const charge = await stripe.charges.create({
      amount: Math.round(amount * 100),
      currency,
      source: card_token,
      description: `Payment for Fee ID: ${fee_id}`,
    });

    // Award green points if payment is paperless
    if (isPaperless) {
      await awardGreenPoints(citizen_id, amount);
    }

    const payment = await savePaymentRecord(
      citizen_id,
      fee_id,
      amount,
      currency,
      charge
    );

    return res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      payment,
    });
  } catch (error) {
    return handleError(res, "Payment failed", error);
  }
};

// Process Installment Payment
exports.processInstallmentPayment = async (req, res) => {
  const { citizen_id, fee_id, amount, isPaperless } = req.body;

  try {
    const citizen = await validateCitizen(citizen_id);
    if (!citizen)
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });

    let installmentPlan = await InstallmentPayment.findOne({
      citizen_id,
      fee_id,
    });
    if (!installmentPlan)
      return res
        .status(404)
        .json({ success: false, message: "Installment plan not found" });

    if (installmentPlan.remaining_balance <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Payment already completed" });

    // Mock charge transaction
    const charge = { id: "txn_" + Date.now() };

    installmentPlan.amount_paid += amount;
    installmentPlan.remaining_balance -= amount;
    installmentPlan.status =
      installmentPlan.remaining_balance <= 0 ? "Completed" : "Pending";
    installmentPlan.installments.push({
      payment_date: new Date(),
      amount_paid: amount,
      transaction_reference: charge.id,
    });

    await installmentPlan.save();

    // Award green points if payment is paperless
    if (isPaperless) {
      await awardGreenPoints(citizen_id, amount);
    }

    const payment = await savePaymentRecord(
      citizen_id,
      fee_id,
      amount,
      "USD",
      charge
    );

    return res.status(201).json({
      success: true,
      message: "Installment payment processed successfully",
      installmentPlan,
    });
  } catch (error) {
    return handleError(res, "Installment payment failed", error);
  }
};

// Award Green Points for paperless payment
const awardGreenPoints = async (citizen_id, amount) => {
  try {
    const pointsAwarded = Math.round(amount / 10);

    const existingPoints = await GreenPoint.findOne({ citizen_id });
    if (existingPoints) {
      // Update existing points
      existingPoints.points += pointsAwarded;
      await existingPoints.save();
    } else {
      // Create new GreenPoint record for the citizen
      const newGreenPoints = new GreenPoint({
        citizen_id,
        points: pointsAwarded,
      });
      await newGreenPoints.save();
    }
  } catch (error) {
    console.error("Error awarding green points:", error);
  }
};

// Fetch All Payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("citizen_id", "first_name last_name national_id")
      .populate("fee_id", "fee_name amount");

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    return handleError(res, "Error fetching payments", error);
  }
};

// Fetch Payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate("citizen_id", "first_name last_name national_id")
      .populate("fee_id", "fee_name amount");

    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });

    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return handleError(res, "Error fetching payment", error);
  }
};

// Helper to validate citizen
const validateCitizen = async (citizen_id) => {
  return await Citizen.findById(citizen_id);
};

// Helper to save payment record
const savePaymentRecord = async (
  citizen_id,
  fee_id,
  amount,
  currency,
  charge
) => {
  const payment = new Payment({
    citizen_id,
    fee_id,
    amount_paid: amount,
    currency,
    payment_method: "Credit Card",
    card_details: {
      card_brand: charge.payment_method_details?.card?.brand || "MockCard",
      last_four_digits: charge.payment_method_details?.card?.last4 || "1234",
    },
    payment_status: "Completed",
    transaction_reference: charge.id,
    receipt_url: charge.receipt_url || "",
  });
  return await payment.save();
};

// Handle errors
const handleError = (res, message, error) => {
  return res
    .status(400)
    .json({ success: false, message, error: error.message });
};
