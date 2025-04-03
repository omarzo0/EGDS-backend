const nodemailer = require("nodemailer");

async function testBrevoSMTP() {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: "88cdcc001@smtp-brevo.com",
        pass: "yNK7Z6f81w2XsDjm",
      },
      logger: true, // Enable logging
      debug: true, // Enable debug output
    });

    console.log("Testing SMTP connection...");
    await transporter.verify();
    console.log("SMTP connection verified!");

    // Use either a verified sender or Brevo's domain
    const info = await transporter.sendMail({
      from: '"E-Government Documentation system" <omarkhaled202080@gmail.com>', // Temporary solution

      to: "omarkhaled202080@gmail.com",
      subject: "E-Government Documentation system",
      text: "This email should now be delivered",
      html: "<p>test from graduation project</p>",
    });

    console.log("Test email sent:", info.messageId);
  } catch (err) {
    console.error("SMTP Test Error:", err);
    if (err.response) {
      console.error("SMTP Response:", err.response);
    }
  }
}

testBrevoSMTP();
