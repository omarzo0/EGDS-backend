const DocumentModel = require("../../database/models/digitalWallet");
const mongoose = require("mongoose");

const getAllMyDocuments = async (req, res) => {
  try {
    const { citizen_id } = req.body;
    const requestingUser = req.user;

    const documents = await DocumentModel.find({ citizen_id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while retrieving documents",
      error: error.message,
    });
  }
};

const createDigitalDocument = async (req, res) => {
  try {
    const {
      document_type,
      document_name,
      document_number,
      issue_date,
      expiry_date,
      document_image,
      citizen_id,
    } = req.body;

    // Validate all required fields
    const requiredFields = {
      document_type,
      document_name,
      document_number,
      issue_date,
      expiry_date,
      document_image,
      citizen_id,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const newDocument = await DocumentModel.create({
      document_name,
      document_type,
      document_number,
      issue_date,
      expiry_date,
      document_image,
      citizen_id,
      status: "Issued",
    });

    res.status(201).json({
      success: true,
      message: "Digital document created successfully",
      document: newDocument,
    });
  } catch (error) {
    console.error("Document creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create document",
      error: error.message,
    });
  }
};

const deleteDigitalDocument = async (req, res) => {
  try {
    const { document_id } = req.params; // Changed from national_id to document_id

    if (!mongoose.Types.ObjectId.isValid(document_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID format",
      });
    }

    const deletedDocument = await DocumentModel.findByIdAndDelete(document_id);

    if (!deletedDocument) {
      return res.status(404).json({
        success: false,
        message: "Digital document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Digital document deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllMyDocuments,
  createDigitalDocument,
  deleteDigitalDocument,
};
