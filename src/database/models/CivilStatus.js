const mongoose = require("mongoose");

const civilStatusSchema = new mongoose.Schema({
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    required: true,
  },
  status_type: {
    type: String,
    enum: ["Birth", "Marriage", "Divorce", "Death"],
    required: true,
  },
  status_date: { type: Date, required: true },
  details: { type: String },
});

const CivilStatus = mongoose.model("CivilStatus", civilStatusSchema);

module.exports = CivilStatus;
