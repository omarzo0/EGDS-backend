const { DepartmentModel } = require("../../database/models/department");

// Get all departments
const getAllDepartment = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments", error });
  }
};

// Create a new department
const createDepartment = async (req, res) => {
  try {
    const { id, name, description } = req.body;
    const department = new Department({ id, name, description });

    await department.save();
    res
      .status(201)
      .json({ message: "Department created successfully", department });
  } catch (error) {
    res.status(500).json({ message: "Failed to create department", error });
  }
};

// Update a department by ID
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedDepartment = await Department.findOneAndUpdate(
      { id },
      { name, description },
      { new: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    res
      .status(200)
      .json({ message: "Department updated successfully", updatedDepartment });
  } catch (error) {
    res.status(500).json({ message: "Failed to update department", error });
  }
};

// Delete a department by ID
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDepartment = await Department.findOneAndDelete({ id });

    if (!deletedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete department", error });
  }
};

module.exports = {
  getAllDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
