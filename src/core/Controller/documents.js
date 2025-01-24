const Document = require("../../database/models/Document");

// Create a new document
const createDocument = async (req, res) => {
  try {
    const { document_type, issue_date, expiry_date, status, citizen_id } =
      req.body;

    const newDocument = new Document({
      document_type,
      issue_date,
      expiry_date,
      status,
      citizen_id,
    });

    const savedDocument = await newDocument.save();
    res.status(201).json(savedDocument);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all documents
const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().populate(
      "citizen_id",
      "first_name last_name"
    );
    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a document by ID
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate(
      "citizen_id",
      "first_name last_name"
    );

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(200).json(document);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a document by ID
const updateDocumentById = async (req, res) => {
  try {
    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(200).json(updatedDocument);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a document by ID
const deleteDocumentById = async (req, res) => {
  try {
    const deletedDocument = await Document.findByIdAndDelete(req.params.id);

    if (!deletedDocument) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocumentById,
  deleteDocumentById,
};
