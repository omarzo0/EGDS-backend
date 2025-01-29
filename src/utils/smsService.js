const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);

exports.sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to, // Citizen's phone number
    });
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error("Failed to send SMS", error.message);
    throw new Error("SMS could not be sent");
  }
};
