const mongoose = require("mongoose");

const citizenSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  national_id: { type: String, unique: true, required: true },
  address: { type: String, required: true },
  phone_number: { type: String },
  email: { type: String },
  marital_status: {
    type: String,
    enum: ["Single", "Married", "Divorced", "Widowed"],
    required: true,
  },
});

const Citizen = mongoose.model("Citizen", citizenSchema);

module.exports = Citizen;
