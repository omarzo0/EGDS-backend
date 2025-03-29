const {
  DocumentApplicationModel,
} = require("../../database/models/DocumentApplication");

// Get all document applications
const getAllDocument = async (req, res) => {
  try {
    const documents = await DocumentApplicationModel.find()
      .populate("citizen_id", "first_name last_name email phone_number")
      .populate("department_id", "name")
      .populate("service_id", "name");

    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
      error: error.message,
    });
  }
};

// Get document application by ID
const getDocumentListById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await DocumentApplicationModel.findById(id)
      .populate("citizen_id", "first_name last_name email phone_number")
      .populate("department_id", "name")
      .populate("service_id", "name");

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching document",
      error: error.message,
    });
  }
};

// Update document status (Approve / Reject)
const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!["Approved", "Rejected", "Completed"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const updatedDocument = await DocumentApplicationModel.findByIdAndUpdate(
      id,
      {
        status,
        rejection_reason: status === "Rejected" ? rejection_reason : null,
        approval_date: status === "Approved" ? new Date() : null,
      },
      { new: true }
    );

    if (!updatedDocument) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    res.status(200).json({
      success: true,
      message: `Document status updated to ${status}`,
      data: updatedDocument,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating document status",
      error: error.message,
    });
  }
};

// Delete document application
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDocument = await DocumentApplicationModel.findByIdAndDelete(
      id
    );

    if (!deletedDocument) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting document",
      error: error.message,
    });
  }
};
const getDocumentCount = async (req, res) => {
  try {
    const count = await DocumentApplicationModel.countDocuments();
    res.status(200).json(count);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch document applications count",
      error: error.message,
    });
  }
};

const getDocumentStatusCounts = async (req, res) => {
  try {
    const [approved, pending, inReview, rejected, completed] =
      await Promise.all([
        DocumentApplicationModel.countDocuments({ status: "Approved" }),
        DocumentApplicationModel.countDocuments({ status: "Pending" }),
        DocumentApplicationModel.countDocuments({ status: "In Review" }),
        DocumentApplicationModel.countDocuments({ status: "Rejected" }),
        DocumentApplicationModel.countDocuments({ status: "Completed" }),
      ]);

    res.status(200).json({
      labels: ["Approved", "Pending", "In Review", "Rejected", "Completed"],
      values: [approved, pending, inReview, rejected, completed],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch document status counts",
      error: error.message,
    });
  }
};
module.exports = {
  getAllDocument,
  getDocumentListById,
  updateDocumentStatus,
  deleteDocument,
  getDocumentCount,
  getDocumentStatusCounts,
};
