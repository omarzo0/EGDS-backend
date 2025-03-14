const LogModel = require("../../database/models/Log");

const getAllLog = async (req, res) => {
  try {
    const logs = await LogModel.find().sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving logs", error });
  }
};

module.exports = {
  getAllLog,
};
