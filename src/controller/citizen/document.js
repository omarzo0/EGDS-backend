const {
  DocumentApplicationModel,
} = require("../../database/models/DocumentApplication");

// Citizen applies for a document
const createDocument = async (req, res) => {
  try {
    const {
      citizen_id,
      department_id,
      first_name,
      last_name,
      email,
      phone_number,
      id_number,
      preferred_contact_method,
      document_type,
      amount,
    } = req.body;



    const newDocument = await DocumentApplicationModel.create({
      citizen_id,
      department_id,
      first_name,
      last_name,
      email,
      phone_number,
      id_number,
      preferred_contact_method,
      document_type,
      amount,
      currency,
      status: "Pending",
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
    const { citizen_id } = req.body;

    const document = await DocumentApplicationModel.findById(id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    if (document.citizen_id.toString() !== citizen_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this document",
      });
    }
    if (document.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete an application that has been processed",
      });
    }

    await DocumentApplicationModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Document application deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting document",
      error: error.message,
    });
  }
};

module.exports = {
  createDocument,
  deleteDocument,
};
