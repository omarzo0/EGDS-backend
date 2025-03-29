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
  try {
    // Verify authentication
    if (!req.admin) {
      res.status(401);
      throw new Error("Not authenticated");
    }

    let adminId;
    const isSuperAdmin = req.admin.role === AdminRole.SUPER_ADMIN;

    // Determine which admin to update
    if (req.params.id) {
      // Verify permissions
      if (!isSuperAdmin && req.params.id !== req.admin._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to update this profile");
      }
      adminId = req.params.id;
    } else {
      adminId = req.admin._id;
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      res.status(400);
      throw new Error("Invalid admin ID format");
    }

    const admin = await AdminModel.findById(adminId);
    if (!admin) {
      res.status(404);
      throw new Error("Admin not found");
    }

    // Update fields
    const updatableFields = [
      "first_name",
      "last_name",
      "email",
      "phone_number",
      "birthday_date",
      "languagePreference",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        admin[field] = req.body[field];
      }
    });

    // Handle password update
    if (req.body.password) {
      if (req.body.current_password) {
        const isMatch = await admin.matchPassword(req.body.current_password);
        if (!isMatch) {
          res.status(401);
          throw new Error("Current password is incorrect");
        }
      } else if (req.params.id && !isSuperAdmin) {
        res.status(401);
        throw new Error("Current password required for password changes");
      }
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();

    // Prepare response
    const adminData = updatedAdmin.toObject();
    delete adminData.password;
    delete adminData.isDeleted;
    delete adminData.__v;

    res.status(200).json({
      success: true,
      data: adminData,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(error.statusCode || 500).json({
      status: "error",
      error: {
        code: error.statusCode || 500,
        message: error.message || "Something went wrong.",
      },
    });
  }
});

module.exports = {
  getAdminProfile,
  updateAdminProfile,
};
