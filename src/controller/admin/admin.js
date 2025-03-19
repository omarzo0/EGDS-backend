const Admin = require("../../database/models/admin");
const bcrypt = require("bcrypt");

const getAdminList = async (req, res) => {
  try {
    const admins = await Admin.find();
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
    const { name, email, password, role, age, national_id, phone_number } =
      req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword, // Store hashed password
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
    res
      .status(500)
      .json({ message: "Error creating admin", error: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const existingAdmin = await Admin.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Authorization: Only superadmin or the admin themself can update
    if (req.user.role !== "superadmin" && req.user.id !== id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this admin" });
    }

    // Hash new password if updated
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, req.body, {
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
    const adminToDelete = await Admin.findById(id);
    if (!adminToDelete) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Prevent deletion of superadmins
    if (adminToDelete.role === "superadmin") {
      return res.status(403).json({ message: "Superadmin cannot be deleted" });
    }

    // Only superadmins can delete other admins
    if (req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this admin" });
    }

    await Admin.findByIdAndDelete(id);
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
