const DepartmentModel = require("../../database/models/department");

// Get all departments
const getAllDepartment = async (req, res) => {
  try {
    const departments = await DepartmentModel.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments", error });
  }
};

module.exports = {
  getAllDepartment,
};
