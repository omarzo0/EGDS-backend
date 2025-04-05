const sendReminderEmail = async (document, recipientEmail) => {
  // Implement your email sending logic here
  // This could use Nodemailer or any other email service
  console.log(
    `Sending reminder for ${document.document_type} to ${recipientEmail}`
  );
  console.log(
    `Document ${document.document_name} expires in ${document.days_remaining} days`
  );

  // Example implementation:
  try {
    // const transporter = nodemailer.createTransport(...);
    // await transporter.sendMail({
    //   to: recipientEmail,
    //   subject: `Document Expiration Reminder: ${document.document_name}`,
    //   text: `Your ${document.document_type} (${document.document_number}) will expire in ${document.days_remaining} days.`
    // });

    return true;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return false;
  }
};
