const { AdminModel } = require("../../database/models/admin");
const bcrypt = require("bcrypt");

const getAdminList = async (req, res) => {
  try {
    const admins = await AdminModel.find().select(
      "first_name last_name email role password national_id phone_number createdAt "
    );
    if (!admins.length) {
      return res.status(200).json({ message: "No admins found", admins: [] });
    }
    res.status(200).json({ admins });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving admins", error: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      role,
      birthday_date,
      national_id,
      phone_number,
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !role ||
      !birthday_date ||
      !national_id ||
      !phone_number
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingAdmin = await AdminModel.findOne({
      $or: [{ email }, { national_id }],
    });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Email or National ID already in use",
      });
    }

    // Create new admin
    const newAdmin = new AdminModel({
      first_name,
      last_name,
      email,
      password,
      role,
      birthday_date,
      national_id,
      phone_number,
    });

    await newAdmin.save();
    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: newAdmin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating admin",
      error: error.message,
    });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const existingAdmin = await AdminModel.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Hash new password if updated
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedAdmin = await AdminModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating admin", error: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the admin to delete
    const adminToDelete = await AdminModel.findById(id);
    if (!adminToDelete) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Prevent deletion of superadmins
    if (adminToDelete.role === "super admin") {
      return res.status(403).json({ message: "Superadmin cannot be deleted" });
    }

    await AdminModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting admin", error: error.message });
  }
};

module.exports = {
  getAdminList,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
