const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    required: true,
  },
  title: { type: String, required: true }, 
  sent_date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Pending", "Sent", "Failed"],
    required: true,
  },
});

const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

module.exports = { NotificationModel };
