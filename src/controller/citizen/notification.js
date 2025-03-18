const { NotificationModel } = require("../../database/models/Notification");

const getCitizenNotifications = async (req, res) => {
  try {
    const citizenId = req.user.citizen_id;

    if (!citizenId) {
      return res.status(400).json({ message: "Citizen ID is required" });
    }

    const notifications = await NotificationModel.find({
      citizen_id: citizenId,
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getCitizenNotifications,
};
