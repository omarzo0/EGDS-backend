const { DigitalDocument } = require("../../database/models/digitalWallet");

const getAllDigitalDocument = async (req, res) => {
  try {
    const { national_id } = req.params;

    // Fetch digital documents from the database where id matches national_id
    const documents = await DigitalDocument.findAll({
      where: { id: national_id },
    });

    // Check if documents exist
    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: "No digital documents found." });
    }

    res.status(200).json({ documents });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createDigitalDocument = async (req, res) => {
  try {
    const {
      document_type,
      document_name,
      document_number,
      expiry_date,
      document_image,
    } = req.body;

    // Insert new digital document into the database
    const newDocument = await DigitalDocument.create({
      document_name,
      document_type,
      document_number,
      expiry_date,
      document_image,
    });

    res.status(201).json({
      message: "Digital document created successfully",
      document: newDocument,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteDigitalDocument = async (req, res) => {
  try {
    const { national_id, document_id } = req.params; // Assuming both are passed as route parameters

    // Find and delete the document
    const deletedDocument = await DigitalDocument.destroy({
      where: { id: national_id, document_id: document_id },
    });

    if (!deletedDocument) {
      return res.status(404).json({ message: "Digital document not found." });
    }

    res.status(200).json({ message: "Digital document deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllDigitalDocument,
  createDigitalDocument,
  deleteDigitalDocument,
};
