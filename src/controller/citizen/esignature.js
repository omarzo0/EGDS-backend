const ServiceModel = require("../../database/models/services");
const { eSignatureModel } = require("../../database/models/eSignature");
const { CitizenModel } = require("../../database/models/citizen");
const mongoose = require("mongoose");

const getAllEpapers = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the citizen exists
    const citizen = await CitizenModel.findById(id);
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "Citizen not found" });
    }

    // Find documents and populate related fields
    const documents = await eSignatureModel
      .find({ citizen_id: id })
      .populate("service_id", "name") // Only get name from service
      .populate("department_id", "name"); // Only get name from department

    if (!documents.length) {
      return res.status(200).json({
        success: true,
        message: "No documents found for this citizen",
        data: [],
      });
    }

    const response = {
      success: true,
      documents: documents.map((doc) => ({
        id: doc._id,
        service: doc.service_id ? doc.service_id.name : null,
        department: doc.department_id ? doc.department_id.name : null,
        description: doc.description,
        document_type: doc.document_type, // Add this if you want to show document type
        status: doc.status,
        uploaded_document: doc.uploaded_document, // This should contain your URL
        document_url: doc.document_url,
        uploaded_document_url: doc.uploaded_document_url,
        signed_document: doc.signed_document,
        signed_date: doc.signed_date,
        rejection_reason: doc.rejection_reason,
        last_update: doc.updatedAt,
        createdAt: doc.createdAt,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getDocumentsByCitizenId:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve documents",
      error: error.message,
    });
  }
};


const downloadEpaper = async (req, res) => {
  try {
    const { signed_id } = req.params;

    // Find document by ID and populate related fields
    const document = await eSignatureModel
      .findById(signed_id)
      .populate("service_id", "name")
      .populate("department_id", "name");

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: "Document not found" 
      });
    }

    // Check if the request is for downloading the document
    if (req.query.download && document.status.toLowerCase() === 'signed') {
      if (!document.signed_document) {
        return res.status(404).json({
          success: false,
          message: "Signed document not found",
        });
      }

      // Handle file download
      const filePath = document.signed_document;
      const fileName = `${document.service_id?.name || 'document'}_${document._id}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      if (filePath.startsWith('http')) {
        // For remote URLs
        const response = await fetch(filePath);
        const fileBuffer = await response.buffer();
        return res.send(fileBuffer);
      } else {
        // For local files
        return res.download(filePath);
      }
    }

    // If not downloading, return the document info
    const response = {
      success: true,
      message: "Document found",
      data: {
        id: document._id,
        service: document.service_id ? document.service_id.name : null,
        department: document.department_id ? document.department_id.name : null,
        description: document.description,
        document_type: document.document_type,
        status: document.status,
        uploaded_document: document.uploaded_document,
        document_url: document.document_url,
        uploaded_document_url: document.uploaded_document_url,
        signed_document: document.signed_document,
        signed_date: document.signed_date,
        rejection_reason: document.rejection_reason,
        last_update: document.updatedAt,
        createdAt: document.createdAt,
        download_link: document.status.toLowerCase() === 'signed' 
          ? `${req.originalUrl.split('?')[0]}?download=true` 
          : null,
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in downloadEpaper:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process document",
      error: error.message,
    });
  }
};



const createEpaper = async (req, res) => {
  try {
    const { service_id, description, uploaded_document, citizenId } = req.body;

    // Validation
    if (!service_id || !uploaded_document || !citizenId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: citizenId, service_id, or uploaded document",
      });
    }

    const citizen = await CitizenModel.findById(citizenId);
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Citizen not found",
      });
    }

    const service = await ServiceModel.findById(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const newEpaper = await eSignatureModel.create({
      citizen_id: citizenId,
      department_id: service.department_id,
      service_id: service._id,
      description: description || "No description provided",
      uploaded_document,
    });

    res.status(201).json({
      success: true,
      message: "E-signature document created successfully",
      data: {
        id: newEpaper._id,
        citizen_id: newEpaper.citizen_id,
        citizen_name: `${citizen.first_name}${citizen.last_name}`,
        department: {
          id: service.department_id,
          name: service.department_id.name,
        },
        service: {
          id: service._id,
          name: service.name,
        },
        status: newEpaper.status,
        uploaded_date: newEpaper.createdAt,
        document_url: newEpaper.uploaded_document,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAvailableESignServices = async (req, res) => {
  try {
    const services = await ServiceModel.find({
      serviceType: "esignature",
    }).populate("department_id", "name");

    res.status(200).json({
      success: true,
      data: services.map((s) => ({
        id: s._id,
        name: s.name,
        description: s.Description,
        department: {
          id: s.department_id._id,
          name: s.department_id.name,
        },
        processing_time: s.processing_time,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch e-signature services",
      error: error.message,
    });
  }
};
const getESignServicesByDepartment = async (req, res) => {
  try {
    const { department_id } = req.params;

    // Validate department_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(department_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID format",
      });
    }

    const services = await ServiceModel.find({
      serviceType: "esignature",
      department_id: department_id,
    }).populate("department_id", "name");

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No e-signature services found for this department",
      });
    }

    res.status(200).json({
      success: true,
      data: services.map((s) => ({
        id: s._id,
        name: s.name,
        description: s.Description,
        department: {
          id: s.department_id._id,
          name: s.department_id.name,
        },
        processing_time: s.processing_time,
        fees: s.fees,
        points: s.points,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch e-signature services",
      error: error.message,
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
        message: "E-paper not found",
      });
    }

    // Check if paper status is Pending
    if (paper.status !== "Pending") {
      return res.status(403).json({
        success: false,
        message:
          "Cannot delete e-paper. Only papers with 'Pending' status can be deleted",
        currentStatus: paper.status,
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
        citizen_id: paper.citizen_id,
      },
    });
  } catch (error) {
    console.error("Error deleting e-paper:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllEpapers,
  createEpaper,
  downloadEpaper,
  deleteEpaper,
  getAvailableESignServices,
  getESignServicesByDepartment,
};
