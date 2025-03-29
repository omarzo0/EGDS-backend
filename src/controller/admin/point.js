const ServiceModel = require("../../database/models/services");
const asyncHandler = require("express-async-handler");

const getAllServices = asyncHandler(async (req, res) => {
  const services = await ServiceModel.find({}).select("name points").lean();

  res.status(200).json({
    success: true,
    count: services.length,
    data: services,
  });
});

const updateServicePoints = asyncHandler(async (req, res) => {
  const { points } = req.body;

  if (!points || isNaN(points)) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid points value",
    });
  }

  const service = await ServiceModel.findByIdAndUpdate(
    req.params.id,
    { points },
    { new: true, runValidators: true }
  ).select("name points");

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Service points updated",
    data: service,
  });
});

const deleteService = asyncHandler(async (req, res) => {
  const service = await ServiceModel.findByIdAndDelete(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Service deleted successfully",
    data: { id: req.params.id },
  });
});

module.exports = {
  getAllServices,
  updateServicePoints,
  deleteService,
};
