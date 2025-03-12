const Citizen = require("../models/Citizen"); 
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const getCitizenList = async (req, res) => {
    try {
        const citizens = await Citizen.find();
        res.status(200).json(citizens);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving citizens", error });
    }
};

const createCitizen = async (req, res) => {
    try {
        const { name, nationalId, address, phone } = req.body;
        const newCitizen = new Citizen({ name, nationalId, address, phone });
        await newCitizen.save();
        res.status(201).json({ message: "Citizen created successfully", citizen: newCitizen });
    } catch (error) {
        res.status(500).json({ message: "Error creating citizen", error });
    }
};

const updateCitizen = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCitizen = await Citizen.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCitizen) {
            return res.status(404).json({ message: "Citizen not found" });
        }
        res.status(200).json({ message: "Citizen updated successfully", citizen: updatedCitizen });
    } catch (error) {
        res.status(500).json({ message: "Error updating citizen", error });
    }
};

const deleteCitizen = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized to delete citizen" });
        }
        const deletedCitizen = await Citizen.findByIdAndDelete(id);
        if (!deletedCitizen) {
            return res.status(404).json({ message: "Citizen not found" });
        }
        res.status(200).json({ message: "Citizen deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting citizen", error });
    }
};

module.exports = {
    getCitizenList: [verifyToken, getCitizenList],
    createCitizen: [verifyToken, isAdmin, createCitizen],
    updateCitizen: [verifyToken, isAdmin, updateCitizen],
    deleteCitizen: [verifyToken, isAdmin, deleteCitizen],
};