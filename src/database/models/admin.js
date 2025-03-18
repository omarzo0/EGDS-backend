const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminRole = {
  SUPER_ADMIN: "super admin",
  ADMIN: "admin",
  OFFICER: "officer",
};

// Admin Schema
const adminSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone_number: { type: String, required: true, unique: true },
    national_id: { type: String, required: true, unique: true },
    age: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICER],
      required: true,
    },
    languagePreference: {
      type: String,
      enum: ["en", "ar"],
      default: "en",
    },
  },
  { timestamps: true }
);

// Password Hashing Before Saving
adminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare Password Method
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const AdminModel =
  mongoose.models.Admin || mongoose.model("Admin", adminSchema);

module.exports = { AdminModel, AdminRole };
