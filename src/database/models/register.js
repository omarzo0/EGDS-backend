const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const registerSchema = new mongoose.Schema(
  {
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
    national_id: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Password comparison method
registerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const registerModel =
  mongoose.models.register || mongoose.model("register", registerSchema);

module.exports = { registerModel };