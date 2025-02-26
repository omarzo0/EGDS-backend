const { CitizenModel } = require("../database/models/citizen");

// Create a new citizen
const createCitizen = async (req, res) => {
  try {
    const newCitizen = new Citizen(req.body);
    const savedCitizen = await newCitizen.save();
    res.status(201).json(savedCitizen);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all citizens
const getAllCitizens = async (req, res) => {
  try {
    const citizens = await Citizen.find();
    res.status(200).json(citizens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single citizen by ID
const getCitizenById = async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.params.id);
    if (!citizen) {
      return res.status(404).json({ error: "Citizen not found" });
    }
    res.status(200).json(citizen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a citizen by ID
const updateCitizenById = async (req, res) => {
  try {
    const updatedCitizen = await Citizen.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCitizen) {
      return res.status(404).json({ error: "Citizen not found" });
    }
    res.status(200).json(updatedCitizen);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a citizen by ID
const deleteCitizenById = async (req, res) => {
  try {
    const deletedCitizen = await Citizen.findByIdAndDelete(req.params.id);
    if (!deletedCitizen) {
      return res.status(404).json({ error: "Citizen not found" });
    }
    res.status(200).json({ message: "Citizen deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCitizen,
  getAllCitizens,
  getCitizenById,
  updateCitizenById,
  deleteCitizenById,
};
