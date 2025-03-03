const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "user_type",
    },
    user_type: {
      type: String,
      required: true,
      enum: ["Citizen", "Admin", "Super Admin", "Officer"],
    },
    action: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    login_time: {
      type: Date,
    },
    affected_citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
    },
  },
  { timestamps: true }
);

const LogModel = mongoose.models.Log || mongoose.model("Log", logSchema);

module.exports = { LogModel };
