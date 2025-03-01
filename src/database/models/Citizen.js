const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const citizenSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    national_id: { type: String, unique: true, required: true },
    address: { type: String, required: true },
    phone_number: { type: String },
    email: { type: String, unique: true, required: true },
    marital_status: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed"],
      required: true,
    },
    password: { type: String, required: true },
    languagePreference: {
      type: String,
      enum: ["en", "ar"],
      default: "en",
    },
  },
  { timestamps: true }
);

citizenSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

citizenSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const CitizenModel =
  mongoose.models.Citizen || mongoose.model("Citizen", citizenSchema);

module.exports = { CitizenModel };
