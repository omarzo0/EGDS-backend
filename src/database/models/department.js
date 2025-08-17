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
  ref: "Service",
  localField: "_id",
  foreignField: "department_id",
  justOne: false,
});

const DepartmentModel =
  mongoose.models.Department || mongoose.model("Department", departmentSchema);

module.exports = DepartmentModel;
