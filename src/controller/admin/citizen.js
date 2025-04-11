const { CitizenModel } = require("../../database/models/citizen");
const bcrypt = require("bcrypt");

const getAllCitizen = async (req, res) => {
  try {
    const citizens = await CitizenModel.find().select(
      "first_name middle_name email last_name date_of_birth national_id address phone_number gender marital_status Government"
    );
    if (!citizens.length) {
      return res
        .status(200)
        .json({ message: "No Citizens found", citizens: [] });
    }
    res.status(200).json(citizens);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving citizens", error: error.message });
  }
};

const createCitizen = async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      email,
      last_name,
      date_of_birth,
      national_id,
      address,
      phone_number,
      Government,
      gender,
      marital_status,
      password,
    } = req.body;
    if (
      !first_name ||
      !middle_name ||
      !last_name ||
      !date_of_birth ||
      !national_id ||
      !address ||
      !phone_number ||
      !gender ||
      !marital_status ||
      !password ||
      !email ||
      !Government
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const existingCitizens = await CitizenModel.findOne({
      $or: [{ email }, { national_id }],
    });
    if (existingCitizens) {
      return res.status(400).json({
        success: false,
        message: "Email or National ID already in use",
      });
    }

    const newCitizen = new CitizenModel({
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      national_id,
      address,
      phone_number,
      gender,
      marital_status,
      password,
      email,
      Government,
    });
    await newCitizen.save();
    res.status(201).json({
      success: true,
      message: "Citizen created successfully",
      citizen: newCitizen,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating citizen",
      error: error.message,
    });
  }
};

const updateCitizen = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCitizen = await CitizenModel.findById(id);
    if (!updatedCitizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const UpdatedCitizen = await CitizenModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({
      message: "Citizen updated successfully",
      citizen: UpdatedCitizen,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating citizen", error: error.message });
  }
};

const deleteCitizen = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCitizen = await CitizenModel.findById(id);
    if (!deletedCitizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }
    await CitizenModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Citizen deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting citizen", error: error.message });
  }
};

const getCitizenCount = async (req, res) => {
  try {
    const count = await CitizenModel.countDocuments();
    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch citizen count",
      error: error.message,
    });
  }
};
module.exports = {
  getAllCitizen,
  createCitizen,
  updateCitizen,
  deleteCitizen,
  getCitizenCount,
};
