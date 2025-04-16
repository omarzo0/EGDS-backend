const DocumentModel = require("../../database/models/digitalWallet");
const {CitizenModel} = require("../../database/models/citizen"); 
const mongoose = require("mongoose");

const getDocumentsWithStats = async (req, res) => {
    try {
        const { citizen_id } = req.body;
      // Get all documents with population
      const documents = await DocumentModel.find({})
        .populate(
          "citizen_id",
          "first_name last_name email national_id wallet_status"
        )
        .sort({ expiry_date: 1 })
        .lean();
  
      const now = new Date();
      const validatedDocuments = documents.map((doc) => {
        // Ensure expiry_date is a Date object
        const expiryDate = new Date(doc.expiry_date);
        const timeDiff = expiryDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
        // Recalculate expiration_status to ensure consistency
        let expirationStatus = doc.expiration_status;
        if (daysRemaining <= 0) {
          expirationStatus = "Expired";
        } else if (daysRemaining <= 30) {
          expirationStatus = "Expires Soon";
        } else {
          expirationStatus = "Valid";
        }
  
        return {
          ...doc,
          expiration_status: expirationStatus,
          days_remaining: daysRemaining,
          days_text:
            daysRemaining <= 0
              ? "Expired"
              : `Expires in ${daysRemaining} day${
                  daysRemaining !== 1 ? "s" : ""
                }`,
        };
      });
  
      // Calculate statistics
      const stats = {
        total: validatedDocuments.length,
        valid: validatedDocuments.filter((d) => d.expiration_status === "Valid")
          .length,
        expires_soon: validatedDocuments.filter(
          (d) => d.expiration_status === "Expires Soon"
        ).length,
        expired: validatedDocuments.filter(
          (d) => d.expiration_status === "Expired"
        ).length,
        byType: {},
      };
  
      // Calculate stats by document type
      const documentTypes = [
        ...new Set(validatedDocuments.map((d) => d.document_type)),
      ];
      documentTypes.forEach((type) => {
        const typeDocs = validatedDocuments.filter(
          (d) => d.document_type === type
        );
        stats.byType[type] = {
          total: typeDocs.length,
          valid: typeDocs.filter((d) => d.expiration_status === "Valid").length,
          expires_soon: typeDocs.filter(
            (d) => d.expiration_status === "Expires Soon"
          ).length,
          expired: typeDocs.filter((d) => d.expiration_status === "Expired")
            .length,
        };
      });
  
      return res.status(200).json({
        success: true,
        data: {
          documents: validatedDocuments,
          stats,
          validation: {
            valid_status_count: validatedDocuments.length, // All should be valid now
            total_documents: validatedDocuments.length,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching documents with stats:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch documents",
        error: error.message,
      });
    }
  };



module.exports = {
  getDocumentsWithStats
};
