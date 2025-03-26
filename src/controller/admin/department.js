const DepartmentModel = require("../../database/models/department");

// Get all departments
const getAllDepartment = async (req, res) => {
  try {
    const departments = await DepartmentModel.find().populate("services");
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch departments", error });
  }
};

// Create a new department
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if ("id" in req.body) {
      return res
        .status(400)
        .json({ message: "Invalid field: id should not be provided" });
    }

    // Trim spaces and enforce lowercase for uniqueness
    const formattedName = name.trim().toLowerCase();

    // Check if a department with the same name exists
    const existingDepartment = await DepartmentModel.findOne({
      name: formattedName,
    });

    if (existingDepartment) {
      return res
        .status(400)
        .json({ message: "Department with this name already exists" });
    }

    // Create and save the new department
    const newDepartment = new DepartmentModel({
      name: formattedName,
      description,
    });

    await newDepartment.save();
    res.status(201).json({
      message: "Department created successfully",
      department: newDepartment,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Update a department by ID
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedDepartment = await DepartmentModel.findOneAndUpdate(
      { _id: id },
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
    console.log(error);
    res.status(500).json({ message: "Failed to update department", error });
  }
};

// Delete a department by ID
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDepartment = await DepartmentModel.findOneAndDelete({
      _id: id,
    });

    if (!deletedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete department", error });
  }
};

module.exports = {
  getAllDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
