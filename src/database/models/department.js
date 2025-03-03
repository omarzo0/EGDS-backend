const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = {
  Department: mongoose.model("Department", departmentSchema),
};
