const DocumentModel = require("../../database/models/digitalWallet");
const { CitizenModel } = require("../../database/models/citizen");
const mongoose = require("mongoose");

const getAllDigitalDocument = async (req, res) => {
  try {
    const documents = await DocumentModel.find()
      .populate({
        path: "citizen_id",
        select:
          "first_name email national_id createdAt wallet_status id document_number document_image",
      })
      .sort({ createdAt: -1 });

    // Group documents by citizen
    const citizensMap = new Map();

    documents.forEach((doc) => {
      const citizenId = doc.citizen_id._id.toString();

      if (!citizensMap.has(citizenId)) {
        citizensMap.set(citizenId, {
          citizen: {
            first_name: doc.citizen_id.first_name,
            wallet_id: doc.citizen_id._id,
            email: doc.citizen_id.email,
            national_id: doc.citizen_id.national_id,
            account_created: doc.citizen_id.createdAt,
            wallet_status: doc.citizen_id.wallet_status || "active",
          },
          documents: [],
        });
      }

      citizensMap.get(citizenId).documents.push({
        id: doc._id,
        name: doc.document_name,
        type: doc.document_type,
        number: doc.document_number,
        status: doc.status,
        created_at: doc.createdAt,
        expiry_date: doc.expiry_date,
        document_image: doc.document_image,
      });
    });

    // Convert map to array
    const result = Array.from(citizensMap.values());

    res.status(200).json({
      success: true,
      wallet_count: citizensMap.size, // This gives the count of unique wallets
      document_count: documents.length, // Keep document count if needed
      citizens: result,
    });
  } catch (error) {
    console.error("Admin document fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve documents",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
const getDigitalWalletById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate wallet ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "Invalid wallet ID format",
        },
      });
    }

    // Find the citizen first
    const citizen = await CitizenModel.findById(id);
    if (!citizen) {
      return res.status(404).json({
        status: "error",
        error: {
          code: 404,
          message: "Citizen wallet not found",
        },
      });
    }

    // Find all documents for this citizen
    const documents = await DocumentModel.find({ citizen_id: id }).sort({
      createdAt: -1,
    });

    // Transform the data to match your frontend structure
    const responseData = {
      citizen: {
        first_name: citizen.first_name,
        wallet_id: citizen._id,
        email: citizen.email,
        national_id: citizen.national_id,
        account_created: citizen.createdAt,
        wallet_status: citizen.wallet_status || "active",
      },
      documents: documents.map((doc) => ({
        id: doc._id,
        name: doc.document_name,
        type: doc.document_type,
        number: doc.document_number,
        status: doc.status,
        created_at: doc.createdAt,
        expiry_date: doc.expiry_date,
        document_image: doc.document_image,
      })),
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Wallet details fetch error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: 500,
        message: "Failed to retrieve wallet details",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
    });
  }
};
const UpdateDigitalDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate document ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid document ID format",
      });
    }

    // Status mapping from frontend to backend
    const statusMap = {
      approve: "Issued",
      reject: "Revoked",
      pending: "Pending",
    };

    const backendStatus = statusMap[status] || status;

    // Validate status
    if (!["Issued", "Pending", "Revoked", "finished"].includes(backendStatus)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value",
      });
    }

    // Update document
    const updatedDoc = await DocumentModel.findByIdAndUpdate(
      id,
      { status: backendStatus },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: updatedDoc._id,
        status: updatedDoc.status,
        updatedAt: updatedDoc.updatedAt,
      },
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
const deleteDigitalWallet = async (req, res) => {
  try {
    const { citizen_id } = req.params;

    // Validate citizen ID
    if (!mongoose.Types.ObjectId.isValid(citizen_id)) {
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "Invalid citizen ID format",
        },
      });
    }

    // Delete all documents for this citizen
    const result = await DocumentModel.deleteMany({ citizen_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: "error",
        error: {
          code: 404,
          message: "No documents found for this citizen",
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        citizen_id,
        deleted_document_count: result.deletedCount,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Wallet deletion error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: 500,
        message: "Failed to delete digital wallet",
        error: error.message,
      },
    });
  }
};
const deleteDigitalDocument = async (req, res) => {
  try {
    const { document_id } = req.params;

    // Validate document ID
    if (!mongoose.Types.ObjectId.isValid(document_id)) {
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "Invalid document ID format",
        },
      });
    }

    // Check document exists and get citizen reference
    const document = await DocumentModel.findById(document_id);
    if (!document) {
      return res.status(404).json({
        status: "error",
        error: {
          code: 404,
          message: "Document not found",
        },
      });
    }
    // Perform deletion
    await DocumentModel.findByIdAndDelete(document_id);

    res.status(200).json({
      status: "success",
      data: {
        document_id,
        document_name: document.document_name,
        type: document.document_type,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Document deletion error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: 500,
        message: "Failed to delete document",
        error: error.message,
      },
    });
  }
};

const getDigitalWalletStatistics = async (req, res) => {
  try {
    // First get all distinct citizen IDs that have documents
    const allCitizenIds = await DocumentModel.distinct("citizen_id");
    const totalWallets = allCitizenIds.length;

    // Then get counts for documents
    const [totalDocuments, activeDocuments, suspendedDocuments] =
      await Promise.all([
        DocumentModel.countDocuments(),
        DocumentModel.countDocuments({
          status: { $in: ["Issued", "Pending"] },
        }),
        DocumentModel.countDocuments({ status: "Revoked" }),
      ]);

    // Now calculate active/suspended wallets properly
    let activeWallets = 0;
    let suspendedWallets = 0;

    // Check each citizen's documents
    for (const citizenId of allCitizenIds) {
      const citizenDocs = await DocumentModel.find({ citizen_id: citizenId });
      const hasActive = citizenDocs.some((doc) =>
        ["Issued", "Pending"].includes(doc.status)
      );
      const allSuspended = citizenDocs.every((doc) => doc.status === "Revoked");

      if (hasActive) activeWallets++;
      if (allSuspended) suspendedWallets++;
    }

    res.status(200).json({
      status: "success",
      data: {
        wallets: {
          total: totalWallets,
          active: activeWallets,
          suspended: suspendedWallets,
        },
        documents: {
          total: totalDocuments,
          active: activeDocuments,
          suspended: suspendedDocuments,
        },
        last_updated: new Date(),
      },
    });
  } catch (error) {
    console.error("Statistics error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: 500,
        message: "Failed to retrieve statistics",
        error: error.message,
      },
    });
  }
};
const suspendDigitalWallet = async (req, res) => {
  try {
    const { citizen_id } = req.params;

    // Validate citizen ID
    if (!mongoose.Types.ObjectId.isValid(citizen_id)) {
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "Invalid citizen ID format",
        },
      });
    }

    // Check if citizen exists
    const citizen = await CitizenModel.findById(citizen_id);
    if (!citizen) {
      return res.status(404).json({
        status: "error",
        error: {
          code: 404,
          message: "Citizen not found",
        },
      });
    }

    // Suspend all documents for this citizen
    const result = await DocumentModel.updateMany(
      { citizen_id },
      { status: "Revoked" }
    );

    // Update citizen wallet status if you're using that field
    await CitizenModel.findByIdAndUpdate(citizen_id, {
      wallet_status: "suspended",
    });

    res.status(200).json({
      status: "success",
      data: {
        citizen_id,
        suspended_document_count: result.modifiedCount,
        wallet_status: "suspended",
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Wallet suspension error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: 500,
        message: "Failed to suspend digital wallet",
        error: error.message,
      },
    });
  }
};

const unsuspendDigitalWallet = async (req, res) => {
  try {
    const { citizen_id } = req.params;

    // Validate citizen ID
    if (!mongoose.Types.ObjectId.isValid(citizen_id)) {
      return res.status(400).json({
        status: "error",
        error: {
          code: 400,
          message: "Invalid citizen ID format",
        },
      });
    }

    // Check if citizen exists
    const citizen = await CitizenModel.findById(citizen_id);
    if (!citizen) {
      return res.status(404).json({
        status: "error",
        error: {
          code: 404,
          message: "Citizen not found",
        },
      });
    }

    // Unsuspend all documents for this citizen (set to "Issued")
    const result = await DocumentModel.updateMany(
      { citizen_id },
      { status: "Issued" }
    );

    // Update citizen wallet status if you're using that field
    await CitizenModel.findByIdAndUpdate(citizen_id, {
      wallet_status: "active",
    });

    res.status(200).json({
      status: "success",
      data: {
        citizen_id,
        unsuspended_document_count: result.modifiedCount,
        wallet_status: "active",
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Wallet unsuspension error:", error);
    res.status(500).json({
      status: "error",
      error: {
        code: 500,
        message: "Failed to unsuspend digital wallet",
        error: error.message,
      },
    });
  }
};

module.exports = {
  getAllDigitalDocument,
  UpdateDigitalDocumentStatus,
  deleteDigitalDocument,
  deleteDigitalWallet,
  getDigitalWalletStatistics,
  suspendDigitalWallet,
  unsuspendDigitalWallet,
  getDigitalWalletById,
};
