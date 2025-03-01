const mongoose = require("mongoose");
const { NotificationModel } = require("../../database/models/Notification");

// Function to send a notification
const sendNotification = async (citizenId, title, status = "Pending") => {
  try {
    const notification = new NotificationModel({
      citizen_id: citizenId,
      title: title,
      status: status,
    });

    await notification.save();
    console.log("Notification sent successfully.");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// Function to check for document expiry and send a warning notification
const checkForDocumentExpiry = async () => {
  try {
    const today = new Date();
    const expiryDateThreshold = new Date(today);
    expiryDateThreshold.setDate(today.getDate() + 7); 

    const documentsToExpire = await DocumentModel.find({
      expiryDate: { $lte: expiryDateThreshold },
      status: "Active", 
    });

    for (const doc of documentsToExpire) {
      await sendNotification(
        doc.citizen_id,
        `Your document with ID ${doc._id} is about to expire in 7 days. Please take action.`,
        "Pending"
      );
    }
  } catch (error) {
    console.error("Error checking document expiry:", error);
  }
};

  

checkForDocumentExpiry();
