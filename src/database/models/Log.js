const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  affected_citizen_id: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen" },
});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
