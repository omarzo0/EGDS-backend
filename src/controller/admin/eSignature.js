const { eSignatureModel } = require("../../database/models/eSignature");
const fs = require("fs");
const path = require("path");

const getAllSignature = async (req, res) => {
  try {
    const { status, department_id, service_id } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (department_id) filter.department_id = department_id;
    if (service_id) filter.service_id = service_id;

    const signatures = await eSignatureModel
      .find(filter)
      .populate("citizen_id", "name email")
      .populate("department_id", "name")
      .populate("service_id", "name");

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

    // Return signed document if available, otherwise original
    const documentToShow =
      signature.signed_document || signature.uploaded_document;
    const isSigned = signature.status === "Signed";

    res.status(200).json({
      success: true,
      data: {
        ...signature.toObject(),
        current_document: documentToShow,
        is_signed: isSigned,
      },
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
    const { status, uploaded_document_url } = req.body;
    const { rejection_reason } = req.body; // Separate line since it's optional
    const id = req.params.id || req.body.document_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Document ID is required in either URL params or request body",
      });
    }

    // Find the existing signature
    const signature = await eSignatureModel.findById(id);
    if (!signature) {
      return res.status(404).json({
        success: false,
        message: "Signature not found",
      });
    }

    let updatedSignature;

    // Handle document signing
    if (status === "Signed") {
      // Handle base64 signature data
      if (uploaded_document_url && uploaded_document_url.startsWith('data:image')) {
        try {
          const base64Data = uploaded_document_url.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          const filename = `signature-${id}-${Date.now()}.png`;
          const filePath = path.join(__dirname, "../../uploads/signatures", filename);

          // Ensure directory exists
          await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
          await fs.promises.writeFile(filePath, buffer);

          // Clean up old file if it exists
          if (signature.signed_document && await fileExists(signature.signed_document)) {
            await fs.promises.unlink(signature.signed_document);
          }

          updatedSignature = await eSignatureModel.findByIdAndUpdate(
            signature._id,
            {
              signed_document: filePath,
              status
            },
            { new: true }
          );
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Failed to process signature image",
            error: error.message,
          });
        }
      } 
      // Handle file upload
      else if (req.file) {
        try {
          // Clean up old file if it exists
          if (signature.signed_document && await fileExists(signature.signed_document)) {
            await fs.promises.unlink(signature.signed_document);
          }

          updatedSignature = await eSignatureModel.findByIdAndUpdate(
            signature._id,
            {
              signed_document: req.file.path,
              status
            },
            { new: true }
          );
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Failed to process uploaded file",
            error: error.message,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Valid signature data (base64 image or file upload) is required for signing",
        });
      }
    }
    // Handle rejection
    else if (status === "Rejected") {
      if (!rejection_reason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required when rejecting",
        });
      }

      updatedSignature = await eSignatureModel.findByIdAndUpdate(
        signature._id,
        {
          status,
          rejection_reason,
        },
        { new: true }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Signature updated successfully",
      data: updatedSignature,
    });

  } catch (error) {
    console.error("Error in handleSignature:", error);
    return res.status(500).json({
      success: false,
      message: "Operation failed",
      error: error.message,
    });
  }
};

// Helper function to check if file exists
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}


// Delete an e-signature record
const deleteSignature = async (req, res) => {
  try {
    const { id } = req.params;

    const signature = await eSignatureModel.findById(id);
    if (!signature) {
      return res.status(404).json({
        success: false,
        message: "Signature not found",
      });
    }

    // Delete associated files
    if (
      signature.uploaded_document &&
      fs.existsSync(signature.uploaded_document)
    ) {
      fs.unlinkSync(signature.uploaded_document);
    }
    if (signature.signed_document && fs.existsSync(signature.signed_document)) {
      fs.unlinkSync(signature.signed_document);
    }

    await eSignatureModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Signature and associated files deleted successfully",
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
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [pendingCount, processedTodayCount, totalProcessedCount] =
      await Promise.all([
        eSignatureModel.countDocuments({ status: "Pending" }),
        eSignatureModel.countDocuments({
          status: { $in: ["Signed", "Rejected"] },
          updatedAt: { $gte: todayStart, $lte: todayEnd },
        }),
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
