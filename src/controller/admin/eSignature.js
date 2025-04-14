const { eSignatureModel } = require("../../database/models/eSignature");
const mongoose = require("mongoose");

const getAllSignature = async (req, res) => {
  try {
    const { status, department_id, service_id } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (department_id) filter.department_id = department_id;
    if (service_id) filter.service_id = service_id;

    const signatures = await eSignatureModel
      .find(filter)
      .populate("citizen_id", "name email") // Populate citizen details
      .populate("department_id", "name") // Populate department name
      .populate("service_id", "name"); // Populate service name

    res.status(200).json({
      success: true,
      data: signatures,
      count: signatures.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch signatures",
      error: error.message,
    });
  }
};

// Get a specific e-signature by ID
const getSignatureListById = async (req, res) => {
  try {
    const { id } = req.params;

    const signature = await eSignatureModel
      .findById(id)
      .populate("citizen_id", "name email")
      .populate("department_id", "name")
      .populate("service_id", "name");

    if (!signature) {
      return res.status(404).json({
        success: false,
        message: "Signature not found",
      });
    }

    res.status(200).json({
      success: true,
      data: signature,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch signature",
      error: error.message,
    });
  }
};

const handleSignature = async (req, res) => {
  try {
    // CREATE NEW SIGNATURE (Citizen action)
    if (req.method === "POST") {
      const { citizen_id, department_id, service_id, description } = req.body;

      if (!req.file && !req.body.uploaded_document_url) {
        return res.status(400).json({
          success: false,
          message: "Either uploaded_document file or URL is required",
        });
      }

      const newSignature = new eSignatureModel({
        citizen_id,
        department_id,
        service_id,
        description,
        uploaded_document: req.file?.path || req.body.uploaded_document_url,
        status: "Pending",
      });

      await newSignature.save();

      return res.status(201).json({
        success: true,
        message: "Signature request created successfully",
        data: newSignature,
      });
    }

    // UPDATE SIGNATURE (Admin action)
    if (req.method === "PUT") {
      const { id } = req.params;
      const { status, description, rejection_reason } = req.body;

      const updateData = {
        description,
        updatedAt: new Date(),
      };

      // Handle document signing
      if (req.file) {
        updateData.signed_document = req.file.path;
        updateData.status = "Signed";
        updateData.signed_date = new Date();
      }
      // Handle rejection
      else if (status === "Rejected") {
        if (!rejection_reason) {
          return res.status(400).json({
            success: false,
            message: "Rejection reason is required",
          });
        }
        updateData.status = "Rejected";
        updateData.rejection_reason = rejection_reason;
      }
      // Handle other status updates
      else if (status) {
        updateData.status = status;
      }

      const updatedSignature = await eSignatureModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate("citizen_id", "name email");

      if (!updatedSignature) {
        return res.status(404).json({
          success: false,
          message: "Signature not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Signature updated successfully",
        data: updatedSignature,
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Operation failed",
      error: error.message,
    });
  }
};

// Delete an e-signature record
const deleteSignature = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSignature = await eSignatureModel.findByIdAndDelete(id);

    if (!deletedSignature) {
      return res.status(404).json({
        success: false,
        message: "Signature not found",
      });
    }

    // TODO: You might want to delete the associated files here

    res.status(200).json({
      success: true,
      message: "Signature deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete signature",
      error: error.message,
    });
  }
};
const getSignatureCounts = async (req, res) => {
  try {
    // Get current date at start of day for filtering
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Execute all count queries in parallel
    const [pendingCount, processedTodayCount, totalProcessedCount] =
      await Promise.all([
        // Pending documents count
        eSignatureModel.countDocuments({ status: "Pending" }),

        // Documents processed today (signed or rejected)
        eSignatureModel.countDocuments({
          status: { $in: ["Signed", "Rejected"] },
          updatedAt: { $gte: todayStart, $lte: todayEnd },
        }),

        // Total processed documents (all signed/rejected)
        eSignatureModel.countDocuments({
          status: { $in: ["Signed", "Rejected"] },
        }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        pendingDocuments: pendingCount,
        processedToday: processedTodayCount,
        totalProcessed: totalProcessedCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch document counts",
      error: error.message,
    });
  }
};
module.exports = {
  getAllSignature,
  getSignatureListById,
  handleSignature,
  deleteSignature,
  getSignatureCounts,
};
