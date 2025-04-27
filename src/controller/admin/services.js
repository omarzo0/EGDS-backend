const ServiceModel = require("../../database/models/services");
const DepartmentModel = require("../../database/models/department");

// Get All Services
const getAllServices = async (req, res) => {
  try {
    const services = await ServiceModel.find().populate({
      path: "department_id",
      select: "name",
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

// Create a New Service
const createService = async (req, res) => {
  try {
    const {
      name,
      departmentName,
      Description,
      fees,
      processing_time,
      serviceType,
      additionalInformation,
      importantNotes,
      availableLocations,
    } = req.body;

    // Check if the department exists by name
    const department = await DepartmentModel.findOne({ name: departmentName });
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    // Validate serviceType
    if (serviceType && !["application", "esignature"].includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid serviceType. Must be either 'application' or 'esignature'",
      });
    }

    // Create the new service
    const newService = new ServiceModel({
      name,
      Description,
      department_id: department._id,
      fees,
      processing_time,
      serviceType: serviceType || "application",
      additionalInformation,
      importantNotes,
      availableLocations: availableLocations || [],
    });

    await newService.save();

    // Increment the serviceCount for the department
    await DepartmentModel.findByIdAndUpdate(
      department._id,
      { $inc: { serviceCount: 1 } },
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

// Update Service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      departmentName,
      Description,
      fees,
      processing_time,
      serviceType,
      additionalInformation,
      importantNotes,
      availableLocations,
    } = req.body;

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

    // Validate serviceType if provided
    if (serviceType && !["application", "esignature"].includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid serviceType. Must be either 'application' or 'esignature'",
      });
    }

    // Update service fields
    service.name = name || service.name;
    service.Description = Description || service.Description;
    service.fees = fees || service.fees;
    service.processing_time = processing_time || service.processing_time;
    service.department_id = department_id;
    service.serviceType = serviceType || service.serviceType;
    service.additionalInformation =
      additionalInformation || service.additionalInformation;
    service.importantNotes = importantNotes || service.importantNotes;

    // Only update availableLocations if provided
    if (availableLocations) {
      service.availableLocations = availableLocations;
    }

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

// Delete Service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await ServiceModel.findById(id);
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    await ServiceModel.findByIdAndDelete(id);

    await DepartmentModel.findByIdAndUpdate(
      service.department_id,
      { $inc: { serviceCount: -1 } },
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
    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch service count",
      error: error.message,
    });
  }
};

// Get most booked services this month
const getMostBookedServicesThisMonth = async (req, res) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const mostBooked = await ServiceModel.find()
      .sort({ usageCount: -1 })
      .limit(10)
      .populate({
        path: "department_id",
        select: "name",
      });

    res.status(200).json({
      success: true,
      services: mostBooked,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch most booked services",
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
  getMostBookedServicesThisMonth,
};
