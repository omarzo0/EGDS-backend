const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    required: true,
  },
  office_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Office",
    required: true,
  },
  appointment_date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Canceled"],
    required: true,
  },
  reason: { type: String },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
