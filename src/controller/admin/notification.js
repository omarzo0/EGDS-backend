const { NotificationModel } = require("../../database/models/Notification");
const mongoose = require("mongoose");
const { CitizenModel } = require("../../database/models/citizen");
const { AdminModel } = require("../../database/models/admin");


const sendNotificationToCitizen = async (req, res) => {
  try {
    const { citizenId } = req.params;
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Title and message are required" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(citizenId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid citizen ID format" 
      });
    }

    const citizen = await CitizenModel.findById(citizenId);
    if (!citizen) {
      return res.status(404).json({ 
        success: false, 
        message: "Citizen not found" 
      });
    }

    const notification = await NotificationModel.create({
      recipient: citizenId,
      recipientType: "Citizen",
      title,
      message,
      status: "Sent",
      senderType: "Admin"
    });

    res.status(201).json({
      success: true,
      message: "Notification sent to citizen",
      data: notification
    });

  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message.replace(/^Mongo(DB)?Error: /, '')
    });
  }
};


const sendNotificationToAllCitizens = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Title and message are required" 
      });
    }

    const notification = await NotificationModel.create({
      recipient: "all",
      recipientType: "Citizen",
      isBroadcast: true,
      title,
      message,
      status: "Sent",
      senderType: "Admin"
    });

    res.status(201).json({
      success: true,
      message: "Notification broadcasted to all citizens",
      data: notification
    });

  } catch (error) {
    console.error("Error broadcasting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to broadcast notification",
      error: error.message.replace(/^Mongo(DB)?Error: /, '')
    });
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
    })
      .sort({ createdAt: -1 })
      .lean();

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

    // Normalize the role value to match your database
    const normalizedRole =
      role.toLowerCase().replace(/\s+/g, " ") === "super admin"
        ? "super admin"
        : role.toLowerCase() === "admin"
        ? "admin"
        : role.toLowerCase() === "officer"
        ? "officer"
        : role.toLowerCase();
    // Fetch admins based on role - ensure this matches your AdminModel schema
    const admins = await AdminModel.find(
      { role: normalizedRole },
      "_id role"
    ).session(session);

    if (!admins.length) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: `No admins with role ${role} found`,
      });
    }

    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      recipientType: "Admin",
      role: admin.role, // Use the actual role from the admin document
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
      data: {
        count: admins.length,
        role: normalizedRole,
      },
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


const sendNotificationToAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { title, message } = req.body;

    // Validate admin ID format
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID format",
      });
    }

    // Check if required fields are present
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    // Verify admin exists
    const adminExists = await AdminModel.exists({ _id: adminId });
    if (!adminExists) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Create and save the notification
    const notification = await NotificationModel.create({
      recipient: adminId,
      recipientType: "Admin",
      title,
      message,
      status: "Sent",
      senderType: "System", // or "Admin" if sent by another admin
    });

    return res.status(201).json({
      success: true,
      message: "Notification sent to admin successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error sending notification to admin:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send notification to admin",
      error: error.message,
    });
  }
};



const sendNotificationToAllAdmins = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, message } = req.body;

    if (!title || !message) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    // Fetch all admins
    const admins = await AdminModel.find({}, "_id").session(session);

    if (!admins.length) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "No admins found to notify",
      });
    }

    // Prepare notifications for all admins
    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      recipientType: "Admin",
      title,
      message,
      status: "Sent",
      senderType: "System",
      createdAt: new Date(),
    }));

    // Bulk insert notifications
    await NotificationModel.insertMany(notifications, { session });
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Notifications sent to ${admins.length} admins`,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error sending notifications to all admins:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notifications to admins",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};


const sendExpirationNotification = async (document, daysUntilExpiry) => {
  let title, message;

  switch (daysUntilExpiry) {
    case 45:
      title = "Document Expiration Reminder (45 Days)";
      message = `Your ${document.document_type} (${
        document.document_number
      }) will expire on ${document.expiry_date.toDateString()}. Please renew it soon.`;
      break;
    case 30:
      title = "Document Expiration Reminder (30 Days)";
      message = `Your ${
        document.document_type
      } is expiring in 30 days (${document.expiry_date.toDateString()}).`;
      break;
    case 15:
      title = "Urgent: Document Expiring Soon (15 Days)";
      message = `Your ${document.document_type} will expire in 15 days! Renew now to avoid issues.`;
      break;
    case 5:
      title = "Final Reminder: Document Expiring (5 Days)";
      message = `IMPORTANT: Your ${
        document.document_type
      } expires in 5 days on ${document.expiry_date.toDateString()}.`;
      break;
    default:
      return;
  }

  try {
    await NotificationModel.create({
      recipient: document.citizen_id,
      recipientType: "Citizen",
      title,
      message,
      status: "Sent",
    });

    // Mark notification as sent
    await DocumentModel.findByIdAndUpdate(document._id, {
      reminder_sent: true,
    });
  } catch (error) {
    console.error(`Failed to send ${daysUntilExpiry}-day notification:`, error);
  }
};


const countUnreadNotificationsForAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Admin ID format",
      });
    }

    const count = await NotificationModel.countDocuments({
      recipient: new mongoose.Types.ObjectId(adminId),
      recipientType: "Admin",
      read: false,
      status: "Sent", // Only count successfully sent notifications
    });

    return res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Error counting notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const markAllNotificationsRead = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Admin ID format",
      });
    }

    const result = await NotificationModel.updateMany(
      {
        recipient: new mongoose.Types.ObjectId(adminId),
        recipientType: "Admin",
        read: false,
      },
      { $set: { read: true } }
    );

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = {
  sendNotificationToCitizen,
  sendNotificationToAllCitizens,
  sendNotificationToAdminsByType,
  getNotificationsForAdmin,
  sendNotificationToAdmin,
  sendNotificationToAllAdmins,
  sendExpirationNotification,
  countUnreadNotificationsForAdmin,

  markAllNotificationsRead,
};
