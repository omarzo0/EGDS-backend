const { CitizenModel } = require("../../database/models/citizen");
const bcrypt = require("bcryptjs");

const getAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const citizen = await CitizenModel.findById(id)
      .select(
        "first_name last_name phone_number national_id email date_of_birth Government -_id"
      )
      .lean();

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    const formattedCitizen = {
      ...citizen,
      birthday: citizen.date_of_birth?.toISOString().split("T")[0],
    };

    res.status(200).json({
      success: true,
      data: formattedCitizen,
    });
  } catch (error) {
    console.error("Error fetching citizen account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const updateMe = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const citizen = await CitizenModel.findById(id);

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    const alwaysUpdatable = [
      "phone_number",
      "email",
      "address",
      "marital_status",
      "password",
      "Government",
    ];

    const oneTimeUpdatable = ["date_of_birth", "gender"];

    const nonUpdatable = [
      "first_name",
      "last_name",
      "middle_name",
      "national_id",
    ];

    const updateObject = {};
    const errors = [];

    for (const [key, value] of Object.entries(updates)) {
      if (nonUpdatable.includes(key)) {
        continue;
      } else if (alwaysUpdatable.includes(key)) {
        if (key === "password") {
          if (value && value.length >= 6) {
            updateObject.password = await bcrypt.hash(value, 10);
          } else if (value) {
            errors.push("Password must be at least 6 characters");
          }
        } else {
          updateObject[key] = value;
        }
      } else if (oneTimeUpdatable.includes(key)) {
        if (
          !citizen[key] ||
          (key === "date_of_birth" && !citizen.date_of_birth)
        ) {
          updateObject[key] = value;
        } else if (value !== undefined && value !== citizen[key]) {
          errors.push(`Cannot update ${key} as it has already been set`);
        }
      } else {
        errors.push(`Field ${key} is not updatable`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors,
      });
    }

    if (Object.keys(updateObject).length > 0) {
      Object.assign(citizen, updateObject);
      await citizen.save();
    }

    const updatedCitizen = await CitizenModel.findById(id).select(
      "-password -__v -createdAt -updatedAt"
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedCitizen,
    });
  } catch (error) {
    console.error("Error updating citizen account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
module.exports = {
  getAccount,
  updateMe,
};
