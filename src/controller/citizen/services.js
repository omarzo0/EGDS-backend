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
const getServicesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const services = await ServiceModel.find({
      department_id: departmentId,
    }).populate("department_id", "name");

    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch department services",
      error: error.message,
    });
  }
};
const getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await ServiceModel.findById(serviceId).populate(
      "department_id",
      "name"
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch service",
      error: error.message,
    });
  }
};

module.exports = {
  getAllServices,
  getServicesByDepartment,
  getServiceById,
};
