// jobs/reminderJob.js
const cron = require("node-cron");
const DocumentModel = require("../../database/models/digitalWallet");
const { CitizenModel } = require("../../database/models/citizen");
const { sendReminderEmail } = require("../utils/reminderUtils");

// Run daily at 9 AM
const setupReminderJob = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      const now = new Date();
      const documents = await DocumentModel.find({
        expiry_date: {
          $gte: now,
          $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
        $or: [
          { reminder_sent: false },
          {
            reminder_sent: true,
            last_reminder_sent: {
              $lte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Not sent in last 7 days
            },
          },
        ],
      }).populate("citizen_id", "email first_name last_name");

      for (const doc of documents) {
        if (doc.citizen_id?.email) {
          const expiryDate = new Date(doc.expiry_date);
          const daysRemaining = Math.ceil(
            (expiryDate - now) / (1000 * 60 * 60 * 24)
          );

          await sendReminderEmail(
            {
              document_name: doc.document_name,
              document_type: doc.document_type,
              document_number: doc.document_number,
              days_remaining: daysRemaining,
            },
            doc.citizen_id.email
          );

          // Update document
          doc.reminder_sent = true;
          doc.last_reminder_sent = now;
          await doc.save();
        }
      }

      console.log(`Sent ${documents.length} expiration reminders`);
    } catch (error) {
      console.error("Error in reminder job:", error);
    }
  });
};

module.exports = setupReminderJob;
