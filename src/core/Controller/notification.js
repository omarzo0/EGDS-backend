const Notification = require("../../database/models/Notification");
const Citizen = require("../../database/models/Citizen");
const twilio = require("twilio");

// Twilio configuration for SMS
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send SMS Notification
const sendSMSNotification = async (req, res) => {
  try {
    const { citizen_id, title, body } = req.body;

    // Fetch the citizen's details
    const citizen = await Citizen.findById(citizen_id);
    if (!citizen) {
      return res.status(404).json({ error: "Citizen not found" });
    }

    if (!citizen.phone_number) {
      return res
        .status(400)
        .json({ error: "Citizen does not have a phone number on file" });
    }

    // Send SMS via Twilio
    await twilioClient.messages.create({
      body: `${title}: ${body}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: citizen.phone_number,
    });

    // Save notification details to the database
    const notification = await Notification.create({
      citizen_id,
      title,
      body,
      status: "Sent",
    });

    res
      .status(200)
      .json({ message: "SMS notification sent successfully", notification });
  } catch (error) {
    console.error(error);

    // Save the failed notification attempt to the database
    await Notification.create({
      citizen_id: req.body.citizen_id,
      title: req.body.title,
      body: req.body.body,
      status: "Failed",
    });

    res.status(500).json({ error: "Failed to send SMS notification" });
  }
};

module.exports = { sendSMSNotification };
