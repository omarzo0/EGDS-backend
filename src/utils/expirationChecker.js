// jobs/expirationChecker.js
const cron = require("node-cron");
const DocumentModel = require("../database/models/digitalWallet");

const {
  sendExpirationNotification,
} = require("../controller/admin/notification");

const checkExpiringDocuments = async () => {
  try {
    const now = new Date();

    const checkDates = [45, 30, 15, 5].map((days) => {
      const date = new Date(now);
      date.setDate(date.getDate() + days);
      return date;
    });

    const documents = await DocumentModel.find({
      expiry_date: { $in: checkDates },
      status: "Issued",
      reminder_sent: false,
    }).populate("citizen_id");

    for (const doc of documents) {
      const expiryDate = doc.expiry_date;
      const timeDiff = expiryDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if ([45, 30, 15, 5].includes(daysDiff)) {
        await sendExpirationNotification(doc, daysDiff);
      }
    }
  } catch (error) {
    console.error("Error checking expiring documents:", error);
  }
};

// Run daily at 9 AM
cron.schedule("0 9 * * *", checkExpiringDocuments);

module.exports = { checkExpiringDocuments };
