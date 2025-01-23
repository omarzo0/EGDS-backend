const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    required: true,
  },
  message: { type: String, required: true },
  sent_date: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Sent", "Failed"], required: true },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
