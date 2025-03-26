const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientType", // Dynamically determines the model based on recipientType
    },
    recipientType: {
      type: String,
      enum: ["Citizen", "Admin"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Sent", "Failed", "Read"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add virtual population
notificationSchema.virtual("recipientDetails", {
  refPath: "recipientType",
  localField: "recipient",
  foreignField: "_id",
  justOne: true,
});

const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

module.exports = { NotificationModel };
