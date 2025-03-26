const { NotificationModel } = require("../../database/models/Notification");
const mongoose = require("mongoose");

const getCitizenNotifications = async (req, res) => {
  try {
    // Get citizen ID from authenticated user
    // Try different common locations where user data might be stored
    const citizenId =
      req.user?._id || req.citizen?._id || req.session?.user?._id;

    // Get notifications for this citizen
    const notifications = await NotificationModel.find({
      recipient: citizenId,
      recipientType: "Citizen",
    })
      .sort({ createdAt: -1 })
      .lean();

    // Separate read and unread notifications
    const unread = notifications.filter((n) => n.status !== "Read");
    const read = notifications.filter((n) => n.status === "Read");

    // Mark notifications as read if requested
    if (req.query.markRead === "true") {
      await NotificationModel.updateMany(
        {
          _id: { $in: unread.map((n) => n._id) },
          recipient: citizenId,
          status: { $ne: "Read" },
        },
        { $set: { status: "Read" } }
      );
    }

    res.status(200).json({
      success: true,
      data: {
        unread,
        read,
        unreadCount: unread.length,
        totalCount: notifications.length,
      },
    });
  } catch (error) {
    console.error("Error getting citizen notifications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getCitizenNotifications,
};
