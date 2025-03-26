const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, lowercase: true },
    description: { type: String },
    serviceCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

departmentSchema.virtual("services", {
  ref: "Service", // Reference the Service model
  localField: "_id", // Field in the Department model
  foreignField: "department_id", // Field in the Service model
  justOne: false, // Return an array of services
});

const DepartmentModel =
  mongoose.models.Department || mongoose.model("Department", departmentSchema);

module.exports = DepartmentModel;
