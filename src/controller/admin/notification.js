const { NotificationModel } = require("../../database/models/Notification");
const mongoose = require("mongoose");
const { CitizenModel } = require("../../database/models/citizen");
const { AdminModel } = require("../../database/models/admin");
const sendNotificationToCitizen = async (req, res) => {
  try {
    const { citizenId } = req.params;
    const { title, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(citizenId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid citizen ID format" });
    }

    if (!title || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Title and message are required" });
    }

    const notification = await NotificationModel.create({
      recipient: citizenId,
      recipientType: "Citizen",
      title,
      message,
      status: "Sent",
      senderType: "Admin",
    });

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

const sendNotificationToAllCitizens = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Title and message are required" });
    }

    const citizens = await CitizenModel.find({}, "_id").session(session);

    if (!citizens.length) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "No citizens found to notify" });
    }

    const notifications = citizens.map((citizen) => ({
      recipient: citizen._id,
      recipientType: "Citizen",
      title,
      message,
      status: "Sent",
      senderType: "Admin",
      createdAt: new Date(),
    }));

    await NotificationModel.insertMany(notifications, { session });
    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: `Notifications sent to ${citizens.length} citizens`,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Notification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notifications",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
const getNotificationsForAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID is required",
      });
    }

    const notifications = await NotificationModel.find({
      recipient: adminId,
      recipientType: "Admin",
    }).sort({ createdAt: -1 }); // Sort by latest first

    return res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

const sendNotificationToAdminsByType = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, message, role } = req.body;

    if (!title || !message || !role) {
      return res.status(400).json({
        success: false,
        message: "Title, message, and admin role are required",
      });
    }

    // Fetch admins based on role
    const admins = await AdminModel.find({ role }, "_id").session(session);

    if (!admins.length) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: `No ${role} found to notify` });
    }

    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      recipientType: "Admin", // Set recipientType to "Admin"
      role,
      title,
      message,
      status: "Sent",
      senderType: "System",
      createdAt: new Date(),
    }));

    await NotificationModel.insertMany(notifications, { session });
    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: `Notifications sent to ${admins.length} ${role}(s)`,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Notification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notifications",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  sendNotificationToCitizen,
  sendNotificationToAllCitizens,
  sendNotificationToAdminsByType,
  getNotificationsForAdmin,
};
