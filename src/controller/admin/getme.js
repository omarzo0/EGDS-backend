const { AdminModel } = require("../../database/models/admin");
const asyncHandler = require("express-async-handler");

const getAdminProfile = asyncHandler(async (req, res) => {
  try {
    // Get ID from params (for frontend) or from auth (for authenticated requests)
    const adminId = req.params.id || req.admin?._id;

    if (!adminId) {
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "Admin ID is required",
        },
      });
    }

    const admin = await AdminModel.findById(adminId)
      .select("-password -isDeleted")
      .lean();

    if (!admin) {
      return res.status(404).json({
        status: "error",
        error: {
          code: 404,
          message: "Admin not found",
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: admin,
    });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: 500,
        message: error.message || "Something went wrong",
      },
    });
  }
});

const updateAdminProfile = asyncHandler(async (req, res) => {
  let adminId;

  if (req.params.id) {
    // Verify the requesting admin has permission to update this profile
    // For example, only super admins can update other admins' profiles
    if (
      req.admin.role !== AdminRole.SUPER_ADMIN &&
      req.params.id !== req.admin._id.toString()
    ) {
      res.status(403);
      throw new Error("Not authorized to update this profile");
    }
    adminId = req.params.id;
  } else {
    // Default to authenticated admin's ID
    adminId = req.admin._id;
  }

  const admin = await AdminModel.findById(adminId);

  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  // List of allowed fields that can be updated
  const updatableFields = [
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "birthday_date",
    "languagePreference",
  ];

  // Update allowed fields
  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      admin[field] = req.body[field];
    }
  });

  // Handle password update with additional security
  if (req.body.password) {
    // For password changes, require current password verification
    if (req.body.current_password) {
      const isMatch = await admin.matchPassword(req.body.current_password);
      if (!isMatch) {
        res.status(401);
        throw new Error("Current password is incorrect");
      }
    } else if (req.params.id && req.admin._id.toString() !== req.params.id) {
      // If updating another admin's profile, don't allow password change without current password
      res.status(401);
      throw new Error("Current password required for password changes");
    }

    admin.password = req.body.password; // Password will be hashed in pre-save hook
  }

  const updatedAdmin = await admin.save();

  // Prepare the response data without sensitive information
  const adminData = updatedAdmin.toObject();
  delete adminData.password;
  delete adminData.isDeleted;
  delete adminData.__v;

  res.status(200).json({
    success: true,
    data: adminData,
    message: "Profile updated successfully",
  });
});

module.exports = {
  getAdminProfile,
  updateAdminProfile,
};
