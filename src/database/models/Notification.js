const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientType",
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
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Sent", "Failed", "Read"],
      default: "Sent",
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
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
