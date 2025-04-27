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
    // CREATE NEW SIGNATURE (Citizen action)
    if (req.method === "POST") {
      const { document_id, description, document_type, uploaded_document_url } =
        req.body;

      // Validate required fields
      if (!document_type) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: document_type",
        });
      }

      // Check for either file upload or URL
      const hasFileUpload = req.file && req.file.path;
      const hasDocumentUrl =
        uploaded_document_url &&
        typeof uploaded_document_url === "string" &&
        uploaded_document_url.trim() !== "";

      if (!hasFileUpload && !hasDocumentUrl) {
        return res.status(400).json({
          success: false,
          message: "Either uploaded_document file or URL is required",
        });
      }

      const citizen_id = req.user?._id;

      const newSignature = new eSignatureModel({
        citizen_id, // Now safely included
        document_id: document_id || new mongoose.Types.ObjectId(),
        description: description || "No description provided",
        document_type,
        uploaded_document: hasFileUpload
          ? req.file.path
          : uploaded_document_url,
        status: "Pending",
      });
      await newSignature.save();

      return res.status(201).json({
        success: true,
        message: "Signature request created successfully",
        data: {
          id: newSignature._id,
          document_id: newSignature.document_id,
          document_type: newSignature.document_type,
          status: newSignature.status,
          document_url: newSignature.uploaded_document,
          uploaded_date: newSignature.createdAt,
        },
      });
    }

    // UPDATE SIGNATURE (Admin action)
    if (req.method === "PUT") {
      // Get ID from both URL params and body (prefer params if both exist)
      const id = req.params.id || req.body.document_id;

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Document ID is required in either URL params or request body",
        });
      }

      const signature = await eSignatureModel.findById(id);
      if (!signature) {
        return res.status(404).json({
          success: false,
          message: "Signature not found",
        });
      }

      const updateData = {
        description: req.body.description || signature.description,
        updatedAt: new Date(),
      };

      // Handle document signing with captured signature
      if (req.body.signature_data) {
        try {
          const base64Data = req.body.signature_data.replace(
            /^data:image\/\w+;base64,/,
            ""
          );
          const buffer = Buffer.from(base64Data, "base64");
          const filename = `signature-${id}-${Date.now()}.png`;
          const filePath = path.join(
            __dirname,
            "../../uploads/signatures",
            filename
          );

          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, buffer);

          if (
            signature.signed_document &&
            fs.existsSync(signature.signed_document)
          ) {
            fs.unlinkSync(signature.signed_document);
          }

          updateData.signed_document = filePath;
          updateData.status = "Signed";
          updateData.signed_date = new Date();
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
        if (
          signature.signed_document &&
          fs.existsSync(signature.signed_document)
        ) {
          fs.unlinkSync(signature.signed_document);
        }

        updateData.signed_document = req.file.path;
        updateData.status = "Signed";
        updateData.signed_date = new Date();
      }
      // Handle rejection
      else if (req.body.status === "Rejected") {
        if (!req.body.rejection_reason) {
          return res.status(400).json({
            success: false,
            message: "Rejection reason is required when rejecting",
          });
        }
        updateData.status = "Rejected";
        updateData.rejection_reason = req.body.rejection_reason;
      }
      // Handle other status updates
      else if (req.body.status) {
        updateData.status = req.body.status;
      }

      const updatedSignature = await eSignatureModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

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
