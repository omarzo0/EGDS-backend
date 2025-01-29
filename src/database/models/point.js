const mongoose = require("mongoose");

const greenPointSchema = new mongoose.Schema({
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    required: true,
  },
  total_points: {
    type: Number,
    default: 0,
  },
  redeemed_points: {
    type: Number,
    default: 0,
  },
  activities: [
    {
      activity_type: {
        type: String,
        enum: ["Paperless Transaction", "Recycling", "Energy Saving"],
        required: true,
      },
      points_earned: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
});

const GreenPoint = mongoose.model("GreenPoint", greenPointSchema);
module.exports = GreenPoint;
