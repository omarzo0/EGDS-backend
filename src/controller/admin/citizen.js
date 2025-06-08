const { CitizenModel } = require("../../database/models/citizen");
const { registerModel } = require("../../database/models/register");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
require("dotenv").config();
const {
  createCitizenSchema,
  updateCitizenSchema,
} = require("../../validation/admin/citizen");

const getAllCitizen = async (req, res) => {
  try {
    const citizens = await CitizenModel.find().select(
      "first_name middle_name email last_name date_of_birth national_id address phone_number gender marital_status Government wallet_status"
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
    const { error, value } = createCitizenSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

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
    } = value;

    const existingCitizen = await CitizenModel.findOne({
      $or: [{ email }, { national_id }],
    });

    if (existingCitizen) {
      return res.status(400).json({
        success: false,
        message: "Email or National ID already in use",
      });
    }

    const encrypt = (text) => {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        Buffer.from(process.env.ENCRYPTION_KEY),
        iv
      );
      let encrypted = cipher.update(text, "utf8", "hex");
      encrypted += cipher.final("hex");
      return `${iv.toString("hex")}:${encrypted}`;
    };

    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedNationalId = encrypt(national_id);

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
      email,
      Government,
    });

    await registerModel.create({
      citizen_id: newCitizen._id,
      national_id: encryptedNationalId,
      password: hashedPassword,
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
    const { error, value } = updateCitizenSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const { id } = req.params;

    const existingCitizen = await CitizenModel.findById(id);
    if (!existingCitizen) {
      return res.status(404).json({ message: "Citizen not found" });
    }

    if (value.password) {
      value.password = await bcrypt.hash(value.password, 10);
    }

    const updatedCitizen = await CitizenModel.findByIdAndUpdate(id, value, {
      new: true,
    });

    res.status(200).json({
      message: "Citizen updated successfully",
      citizen: updatedCitizen,
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
