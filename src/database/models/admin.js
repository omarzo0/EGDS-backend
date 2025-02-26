const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Admin Schema
const adminSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["super admin", "admin", "employee"],
      default: "employee",
      required: true,
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

const AdminModel = mongoose.model("Admin", adminSchema);

module.exports = { AdminModel };
