const log = require("../../database/models/Log");
const Citizen = require("../../database/models/Citizen");
const Admin = require("../../database/models/admin");

exports.createLog = async (req, res) => {
  const { userId, userType, action, affectedCitizenId } = req.body;

  try {
    if (!["Citizen", "Admin"].includes(userType)) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    let user;
    if (userType === "Citizen") {
      user = await Citizen.findById(userId);
    } else if (userType === "Admin") {
      user = await Admin.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: `${userType} not found` });
    }

    const log = new Log({
      user_id: userId,
      user_type: userType,
      action: action,
      affected_citizen_id: affectedCitizenId,
    });

    await log.save();

    res.status(201).json({ message: "Log entry created successfully", log });
  } catch (error) {
    console.error("Error creating log:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all logs (for admin)
exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .populate("user_id")
      .populate("affected_citizen_id");
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Server error" });
  }
};
