const Admin = require("../../database/models/admin");
const jwt = require("jsonwebtoken");

const getAdminList = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving admins", error });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, age, national_id, phone_number } =
      req.body;
    const newAdmin = new Admin({
      name,
      email,
      password,
      role,
      age,
      national_id,
      phone_number,
    });
    await newAdmin.save();
    res
      .status(201)
      .json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "superadmin" && req.user.id !== id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this admin" });
    }
    const updatedAdmin = await Admin.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res
      .status(200)
      .json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error updating admin", error });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const adminToDelete = await Admin.findById(id);
    if (!adminToDelete) {
      return res.status(404).json({ message: "Admin not found" });
    }
    if (adminToDelete.role === "superadmin") {
      return res.status(403).json({ message: "Cannot delete super admin" });
    }
    if (req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this admin" });
    }
    await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin", error });
  }
};

module.exports = {
  getAdminList,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
