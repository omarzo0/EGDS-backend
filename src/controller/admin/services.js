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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch services",
        error: error.message,
      });
  }
};

//  Create a New Service
const createService = async (req, res) => {
  try {
    const { name, department_id } = req.body;

    const departmentExists = await DepartmentModel.findById(department_id);
    if (!departmentExists) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    const newService = new ServiceModel({ name, department_id });
    await newService.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Service created successfully",
        service: newService,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create service",
        error: error.message,
      });
  }
};

//  Update Service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department_id } = req.body;

    const service = await ServiceModel.findById(id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    if (department_id) {
      const departmentExists = await DepartmentModel.findById(department_id);
      if (!departmentExists) {
        return res
          .status(404)
          .json({ success: false, message: "Department not found" });
      }
    }

    service.name = name || service.name;
    service.department_id = department_id || service.department_id;

    await service.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Service updated successfully",
        service,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update service",
        error: error.message,
      });
  }
};

//  Delete Service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await ServiceModel.findByIdAndDelete(id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete service",
        error: error.message,
      });
  }
};

module.exports = {
  getAllServices,
  createService,
  updateService,
  deleteService,
};
