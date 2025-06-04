const { eSignatureModel } = require("../../database/models/eSignature");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const mime = require("mime-types");

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
      if (
        uploaded_document_url &&
        uploaded_document_url.startsWith("data:image")
      ) {
        try {
          const base64Data = uploaded_document_url.replace(
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

          // Ensure directory exists
          await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
          await fs.promises.writeFile(filePath, buffer);

          // Clean up old file if it exists
          if (
            signature.signed_document &&
            (await fileExists(signature.signed_document))
          ) {
            await fs.promises.unlink(signature.signed_document);
          }

          updatedSignature = await eSignatureModel.findByIdAndUpdate(
            signature._id,
            {
              signed_document: filePath,
              status,
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
          if (
            signature.signed_document &&
            (await fileExists(signature.signed_document))
          ) {
            await fs.promises.unlink(signature.signed_document);
          }

          updatedSignature = await eSignatureModel.findByIdAndUpdate(
            signature._id,
            {
              signed_document: req.file.path,
              status,
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
          message:
            "Valid signature data (base64 image or file upload) is required for signing",
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
const downloadEpaper = async (req, res) => {
  const contentType = mime.lookup(filePath) || "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  try {
    const { signed_id } = req.params;

    const document = await eSignatureModel
      .findById(signed_id)
      .populate("service_id", "name")
      .populate("department_id", "name");

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // --- DOWNLOAD LOGIC (WORKS FOR ANY STATUS) ---
    if (req.query.download) {
      const filePath = document.uploaded_document; // ← Always use uploaded document

      if (!filePath) {
        return res.status(404).json({
          success: false,
          message: "No uploaded document file found",
        });
      }

      const ext = path.extname(filePath);
      const fileName = `${document.service_id?.name || "document"}_${
        document._id
      }${ext}`;

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader("Content-Type", contentType);

      if (filePath.startsWith("http")) {
        const response = await fetch(filePath);
        if (!response.ok) {
          return res.status(500).json({
            success: false,
            message: "Failed to fetch remote document",
          });
        }
        const fileBuffer = await response.buffer();
        return res.send(fileBuffer);
      } else {
        const absolutePath = path.resolve(filePath);
        return res.download(absolutePath);
      }
    }

    // --- METADATA RESPONSE (NON-DOWNLOAD REQUEST) ---
    const response = {
      success: true,
      message: "Document found",
      data: {
        id: document._id,
        service: document.service_id?.name || null,
        department: document.department_id?.name || null,
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
        // Always include download link (regardless of status)
        download_link: `${req.originalUrl.split("?")[0]}?download=true`,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in downloadEpaper:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process document",
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
  downloadEpaper,
};
