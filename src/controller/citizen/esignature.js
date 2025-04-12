const ServiceModel = require("../../database/models/services");
const { eSignatureModel } = require("../../database/models/eSignature");
const { CitizenModel } = require("../../database/models/citizen"); 
const mongoose = require("mongoose");


const getAllEpapers = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if the citizen exists by id
    const epapers = await CitizenModel.find({_id: id});
    if (!epapers) {
      return res
        .status(404)
        .json({ success: false, message: "citizen not found" });
    }

    // Find documents using the same ID format stored in documents
    const documents = await eSignatureModel.find({ citizen_id: id })

    if (!documents.length) {
      return res.status(200).json({
        success: true,
        message: "No documents found for this citizen",
        data: []
      });
    }

    // Format the response to match your structure
    const response = {
      success: true,
      documents: documents.map(doc => ({
        id: doc._id,
        service: doc.service_id, // Included from your schema
        department: doc.department_id,      // Direct string from your schema
        description: doc.description,
        status: doc.status,
        uploaded_document: doc.uploaded_document,
        signed_document: doc.signed_document,
        signed_date: doc.signed_date,    // Using createdAt from timestamps
        last_update: doc.updatedAt       // Using updatedAt from timestamps
      }))
    };

    res.status(200).json(response);

  } catch (error) {
    console.error("Error in getDocumentsByCitizenId:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve documents",
      error: error.message
    });
  }
};
const createEpaper = async (req, res) => {
  try {
    // Extract data from request body
    const { 
      document_type,  // This should be the service name
      description, 
      uploaded_document 
    } = req.body;

    // Get citizen_id from URL parameters
    const { id } = req.params;

    // Validate required fields
    if (!document_type || !description || !uploaded_document) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: document_type, description, uploaded_document"
      });
    }

    // Check if the citizen exists
    const citizen = await CitizenModel.findById(id);
    if (!citizen) {
      return res.status(404).json({ 
        success: false, 
        message: "Citizen not found" 
      });
    }

    // Find the service by name and populate department info
    const service = await ServiceModel.findOne({name: document_type});
    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: "Service not found" 
      });
    }

    // Create new e-signature document
    const newEpaper = await eSignatureModel.create({
      citizen_id: id,
      department_id: service.department_id, // Store department reference
      service_id: service._id,      // Store service reference
      description,
      uploaded_document
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "E-signature document created successfully",
      data: {
        id: newEpaper._id,
        citizen_id: newEpaper.citizen_id,
        citizen_name: `${citizen.first_name} ${citizen.last_name}`,
        department: {
          id: service.department_id._id,
          name: newEpaper.department
        },
        service: {
          id: service._id,
          name: newEpaper.document_type
        },
        status: newEpaper.status,
        uploaded_date: newEpaper.createdAt,
        document_url: newEpaper.uploaded_document
      }
    });

  } catch (error) {
    console.error("Error creating e-signature document:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

const deleteEpaper = async (req, res) => {
  try {
    // Get the paper ID from request parameters
    const { id } = req.params;

    // Find the paper by ID
    const paper = await eSignatureModel.findById(id);

    // Check if paper exists
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "E-paper not found"
      });
    }

    // Check if paper status is Pending
    if (paper.status !== "Pending") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete e-paper. Only papers with 'Pending' status can be deleted",
        currentStatus: paper.status
      });
    }

    // Delete the paper
    await eSignatureModel.findByIdAndDelete(id);

    // Return success response
    res.status(200).json({
      success: true,
      message: "E-paper deleted successfully",
      deletedPaper: {
        id: paper._id,
        document_type: paper.document_type,
        citizen_id: paper.citizen_id
      }
    });

  } catch (error) {
    console.error("Error deleting e-paper:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  getAllEpapers,
  createEpaper,
  deleteEpaper,
};
