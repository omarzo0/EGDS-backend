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
    const { uploaded_document_url } = req.body;
    const { rejection_reason } = req.body; // Optional (only for rejections)
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

    // Handle document signing (if signature data is provided)
    if (
      (uploaded_document_url && uploaded_document_url.startsWith("data:image")) ||
      req.body.signature_data
    ) {
      try {
        const base64Data = req.body.signature_data
          ? req.body.signature_data
          : uploaded_document_url.replace(/^data:image\/\w+;base64,/, "");

        const buffer = Buffer.from(base64Data, "base64");
        const filename = `signature-${id}-${Date.now()}.png`;
        const filePath = path.join(
          __dirname,
          "../../uploads/signatures",
          filename
        );

        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, buffer);

        // Delete old signed document if it exists
        if (
          signature.signed_document &&
          (await fileExists(signature.signed_document))
        ) {
          await fs.promises.unlink(signature.signed_document);
        }

        // Update status to "Signed" automatically
        updatedSignature = await eSignatureModel.findByIdAndUpdate(
          signature._id,
          {
            signed_document: filePath,
            status: "Signed", // Auto-set status
            signed_date: new Date(), // Optional: Record signing time
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

    // Handle rejection (if rejection_reason is provided)
    else if (rejection_reason) {
      updatedSignature = await eSignatureModel.findByIdAndUpdate(
        signature._id,
        {
          status: "Rejected",
          rejection_reason,
        },
        { new: true }
      );
    }

    // No valid action (neither signature nor rejection)
    else {
      return res.status(400).json({
        success: false,
        message: "Either signature data or rejection reason must be provided",
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
  try {
    const { signed_id } = req.params;

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

    if (req.query.download && document.status.toLowerCase() === 'signed') {
      if (!document.signed_document) {
        return res.status(404).json({
          success: false,
          message: "Signed document not found",
        });
      }

      const filePath = document.signed_document;
      const ext = path.extname(filePath);
      const fileName = `${document.service_id?.name || 'document'}_${document._id}${ext}`;

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      if (filePath.startsWith('http')) {
        // Remote file (optional fallback)
        const response = await fetch(filePath);
        if (!response.ok) {
          return res.status(500).json({
            success: false,
            message: "Failed to fetch remote document.",
          });
        }
        const fileBuffer = await response.buffer();
        return res.send(fileBuffer);
      } else {
        // Local file
        const absolutePath = path.resolve(filePath);
        return res.download(absolutePath);
      }
    }

    // Not a download request – return metadata
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
        download_link: document.status.toLowerCase() === 'signed' 
          ? `${req.originalUrl.split('?')[0]}?download=true` 
          : null,
      }
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
