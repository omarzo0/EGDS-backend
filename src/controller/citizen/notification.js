const { NotificationModel } = require("../../database/models/Notification");
const mongoose = require("mongoose");

const getCitizenNotifications = async (req, res) => {
  try {
    const { citizenId } = req.params; // Now getting from URL params instead of body

    if (!mongoose.Types.ObjectId.isValid(citizenId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Citizen ID format",
      });
    }

    // Get notifications for this citizen (both specific and broadcast)
    const notifications = await NotificationModel.find({
      $or: [
        { recipient: citizenId, recipientType: "Citizen" }, // Specific to citizen
        { recipient: "all", recipientType: "Citizen" }, // Broadcast to all
      ],
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
          $or: [{ recipient: citizenId }, { recipient: "all" }],
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
