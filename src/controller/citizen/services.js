const ServiceModel = require("../../database/models/services");
const DepartmentModel = require("../../database/models/department");

//  Get All Services
const getAllServices = async (req, res) => {
  try {
    const services = await ServiceModel.find().populate(
      "department_id",
      "name"
    );
    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

module.exports = {
  getAllServices,
};
