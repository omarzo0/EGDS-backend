const { AdminModel } = require("../../database/models/admin");
const bcrypt = require("bcrypt");
const {
  createAdminSchema,
  updateAdminSchema,
} = require("../../validation/admin/admin");

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
    const { error, value } = createAdminSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const {
      first_name,
      last_name,
      email,
      password,
      role,
      birthday_date,
      national_id,
      phone_number,
    } = value;

    const existingAdmin = await AdminModel.findOne({
      $or: [{ email }, { national_id }],
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Email or National ID already in use",
      });
    }

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

    const { error, value } = updateAdminSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const existingAdmin = await AdminModel.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (value.password) {
      value.password = await bcrypt.hash(value.password, 10);
    }

    const updatedAdmin = await AdminModel.findByIdAndUpdate(id, value, {
      new: true,
    });

    res.status(200).json({
      message: "Admin updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating admin",
      error: error.message,
    });
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
