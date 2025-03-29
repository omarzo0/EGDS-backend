const ServiceModel = require("../../database/models/services");
const DepartmentModel = require("../../database/models/department");

//  Get All Services
const getAllServices = async (req, res) => {
  try {
    const services = await ServiceModel.find().populate({
      path: "department_id", // The field to populate
      select: "name", // Only include the department's name
    });

    res.status(200).json({ success: true, services });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

//  Create a New Service
const createService = async (req, res) => {
  try {
    const { name, departmentName, Description, fees, points, processing_time } =
      req.body;

    // Check if the department exists by name
    const department = await DepartmentModel.findOne({ name: departmentName });
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    // Create the new service
    const newService = new ServiceModel({
      name,
      Description,
      department_id: department._id, // Use the department's _id
      fees,
      points,
      processing_time,
    });
    await newService.save();

    // Increment the serviceCount for the department
    await DepartmentModel.findByIdAndUpdate(
      department._id,
      { $inc: { serviceCount: 1 } }, // Increment serviceCount by 1
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: newService,
    });
  } catch (error) {
    res.status(500).json({
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
    const { name, departmentName, Description, fees, points, processing_time } =
      req.body;

    const service = await ServiceModel.findById(id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    let department_id = service.department_id;
    if (departmentName) {
      const department = await DepartmentModel.findOne({
        name: departmentName,
      });
      if (!department) {
        return res
          .status(404)
          .json({ success: false, message: "Department not found" });
      }
      department_id = department._id;
    }

    service.name = name || service.name;
    service.Description = Description || service.Description;
    service.fees = fees || service.fees;
    service.points = points || service.points;
    service.processing_time = processing_time || service.processing_time;
    service.department_id = department_id;

    await service.save();

    const updatedService = await ServiceModel.findById(id).populate({
      path: "department_id",
      select: "name",
    });

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    res.status(500).json({
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

    // Find the service to get the department_id
    const service = await ServiceModel.findById(id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    // Delete the service
    await ServiceModel.findByIdAndDelete(id);

    // Decrement the serviceCount for the department
    await DepartmentModel.findByIdAndUpdate(
      service.department_id,
      { $inc: { serviceCount: -1 } }, // Decrement serviceCount by 1
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete service",
      error: error.message,
    });
  }
};
// Get service count
const getServiceCount = async (req, res) => {
  try {
    const count = await ServiceModel.countDocuments();
    res.status(200).json(count); // Return just the number
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch service count",
      error: error.message,
    });
  }
};
module.exports = {
  getAllServices,
  createService,
  updateService,
  deleteService,
  getServiceCount,
};
