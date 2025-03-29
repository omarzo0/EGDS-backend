const { AdminModel } = require("../../database/models/admin");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

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

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "Invalid admin ID format",
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
          message: "Admin not found. Please check the ID and try again",
        },
      });
    }

    // Check if admin is deleted (soft delete)
    if (admin.isDeleted) {
      return res.status(404).json({
        status: "error",
        error: {
          code: 404,
          message: "Admin account has been deleted",
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
        message:
          error.message || "Something went wrong while fetching admin profile",
      },
    });
  }
});

const updateAdminProfile = asyncHandler(async (req, res) => {
  try {
    // 2. Get Admin ID from params or authenticated user
    const adminId = req.params.id;

    // 3. Validate ID format
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "Invalid admin ID format",
        },
      });
    }

    // 5. Find the admin to update
    const admin = await AdminModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        status: "error",
        error: {
          code: 404,
          message: "Admin not found",
        },
      });
    }

    // 6. Update allowed fields
    const updatableFields = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone_number: req.body.phone_number,
      birthday_date: req.body.birthday_date,
      languagePreference: req.body.languagePreference,
    };

    // Only update fields that were actually passed in the request
    Object.keys(updatableFields).forEach((field) => {
      if (updatableFields[field] !== undefined) {
        admin[field] = updatableFields[field];
      }
    });

    // 7. Handle password change if provided
    if (req.body.password) {
      // For non-super admins, require current password
      if (!isSuperAdmin) {
        if (!req.body.current_password) {
          return res.status(400).json({
            status: "error",
            error: {
              code: 400,
              message: "Current password is required to change password",
            },
          });
        }

        const isMatch = await admin.matchPassword(req.body.current_password);
        if (!isMatch) {
          return res.status(401).json({
            status: "error",
            error: {
              code: 401,
              message: "Current password is incorrect",
            },
          });
        }
      }

      admin.password = req.body.password;
    }

    // 8. Save changes
    const updatedAdmin = await admin.save();

    // 9. Prepare response (remove sensitive data)
    const adminData = updatedAdmin.toObject();
    delete adminData.password;
    delete adminData.isDeleted;
    delete adminData.__v;

    // 10. Return success response
    return res.status(200).json({
      status: "success",
      data: adminData,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(error.statusCode || 500).json({
      status: "error",
      error: {
        code: error.statusCode || 500,
        message: error.message || "An unexpected error occurred",
      },
    });
  }
});

module.exports = {
  getAdminProfile,
  updateAdminProfile,
};
