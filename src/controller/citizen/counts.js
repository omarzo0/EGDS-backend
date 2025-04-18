const { DocumentApplicationModel } = require("../../database/models/DocumentApplication"); 
const DocumentModel = require("../../database/models/digitalWallet"); 
const { eSignatureModel } = require("../../database/models/eSignature");
const mongoose = require("mongoose");

const getcounts = async (req, res) => {
  try {
      // Change from citizen_id to id to match the route parameter
      const { id } = req.params;
      
      if (!id) {
          return res.status(400).json({
              success: false,
              message: "Citizen ID is required in the URL"
          });
      }

      // Validate id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({
              success: false,
              message: "Invalid Citizen ID format"
          });
      }

      // Update all references from citizen_id to id
      const [documentAppsCount, digitalWalletCount, eSignaturesCount] = await Promise.all([
          DocumentApplicationModel.countDocuments({ citizen_id: id }),
          DocumentModel.countDocuments({ citizen_id: id }),
          eSignatureModel.countDocuments({ citizen_id: id })
      ]);

      const totalApplications = documentAppsCount + digitalWalletCount + eSignaturesCount;

      return res.status(200).json({
          success: true,
          data: {
              citizen_id: id,
              counts: {
                  document_applications: documentAppsCount,
                  digital_wallet_documents: digitalWalletCount,
                  e_signatures: eSignaturesCount,
                  total_applications: totalApplications
              }
          }
      });
  } catch (error) {
      console.error("Error fetching document counts:", error);
      return res.status(500).json({
          success: false,
          message: "Failed to fetch document counts",
          error: error.message,
      });
  }
};

module.exports = {
  getcounts
};