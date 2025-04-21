const {
  DocumentApplicationModel,
} = require("../../database/models/DocumentApplication");
const ServiceModel = require("../../database/models/services");
const {CitizenModel} = require("../../database/models/citizen"); 
const mongoose = require("mongoose");


const getDocumentsByCitizenId = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if the citizen exists by id
    const citizen = await CitizenModel.findOne({ _id: id });
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "citizen not found" });
    }

    // Find documents using the same ID format stored in documents
    const documents = await DocumentApplicationModel.find({ citizen_id: id })
      .populate('department_id', 'name description')
      .populate('service_id', 'name processing_time')
      .sort({ createdAt: -1 })
      .lean();

    if (!documents.length) {
      return res.status(200).json({
        success: true,
        message: "No documents found for this citizen",
        data: []
      });
    }

    // Format response
    const response = {
      success: true,
      citizen_info: {
        name: `${citizen.first_name} ${citizen.last_name}`,
        id: citizen.national_id
      },
      documents: documents.map(doc => ({
        id: doc._id,
        document_number: doc.document_number,
        department: doc.department_id,
        service: doc.service_id,
        status: doc.status,
        amount: doc.amount,
        application_date: doc.createdAt,
        last_update: doc.updatedAt
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


// Citizen applies for a document
const createDocument = async (req, res) => {
  try {
    const {
      citizen_id,
      serviceid,
      preferred_contact_method,
      amount
    } = req.body;

    // Check if the department exists by name
    const service = await ServiceModel.findById(serviceid );
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "service not found" });
    }

    // Check if the department exists by name
    const citizen = await CitizenModel.findOne({ national_id: citizen_id });
    if (!citizen) {
      return res
        .status(404)
        .json({ success: false, message: "citizen not found" });
    }

    // Get the count of existing documents to generate an auto-incremented document_number
    const documentCount = await DocumentApplicationModel.countDocuments();
    const document_number = `DOC-${(documentCount + 1).toString().padStart(6, '0')}`;


    const newDocument = await DocumentApplicationModel.create({
      document_number,
      citizen_id: citizen._id,
      department_id: service.department_id,
      service_id: service._id,
      preferred_contact_method,
      amount,
      status: "Pending",
      issued_by: null,
      notes: null,
      // These fields will be null initially and updated later
      approval_date: null,
      rejection_reason: null,
      issued_date: null
    });

    res.status(201).json({
      success: true,
      message: "Document application created successfully",
      data: newDocument,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating document application",
      error: error.message,
    });
  }
};


// Citizen deletes their own document application (only if it's pending)
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    //const { citizen_id } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id) 
      //|| !mongoose.Types.ObjectId.isValid(citizen_id)
    ) 
    {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    const document = await DocumentApplicationModel.findById(id).select('citizen_id status');

    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: "Document not found" 
      });
    }

    // // Authorization check
    // if (document.citizen_id.toString() !== citizen_id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Unauthorized to delete this document",
    //   });
    // }

    // Status validation
    if (document.status !== "Pending") {
      const statusMessage = {
        "Review": "Document is under review and cannot be deleted",
        "Approved": "Approved documents cannot be deleted",
        "Rejected": "Rejected documents cannot be deleted"
      }[document.status] || "Cannot delete processed documents";

      return res.status(400).json({
        success: false,
        message: statusMessage,
        currentStatus: document.status
      });
    }

    // Perform deletion
    const result = await DocumentApplicationModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Document not found or already deleted"
      });
    }

    res.status(200).json({
      success: true,
      message: "Document application deleted successfully",
      deletedDocumentId: id
    });

  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting document",
      error: error.message,
    });
  }
};

module.exports = {
  getDocumentsByCitizenId,
  createDocument,
  deleteDocument,
};
