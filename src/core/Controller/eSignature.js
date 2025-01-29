const multer = require("multer");
const Document = require("../../database/models/eSignature");
const { sendSMS } = require("../../utils/smsService");

// Set up multer for file uploads (you can configure where the files are stored)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Define your uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Ensure unique file names
  },
});

const upload = multer({ storage: storage }).single("uploaded_document"); // Define the field name for the uploaded file

// Citizen uploads the document
exports.uploadDocument = async (req, res) => {
  // Using multer to handle file upload
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "File upload failed", error: err.message });
    }

    const { citizen_id, document_type } = req.body;
    const uploaded_document = req.file ? req.file.path : null;

    try {
      if (!citizen_id || !document_type || !uploaded_document) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newDocument = await Document.create({
        citizen_id,
        document_type,
        uploaded_document,
      });

      res.status(201).json({
        message: "Document uploaded successfully",
        document: newDocument,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Failed to upload document", error: error.message });
    }
  });
};

// Admin uploads signed document
exports.uploadSignedDocument = async (req, res) => {
  const { documentId, signed_document } = req.body;

  try {
    const document = await Document.findById(documentId).populate("citizen_id");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!signed_document) {
      return res.status(400).json({ message: "Signed document is required" });
    }

    // Update the document with signed details
    document.signed_document = signed_document;
    document.status = "Signed";
    document.signed_date = new Date();
    await document.save();

    // Send SMS notification to the citizen
    const smsMessage = `Hello, your document (${document.document_type}) is now signed and available for download.`;
    await sendSMS(document.citizen_id.phone, smsMessage); // Ensure the Citizen model includes a phone field

    res.status(200).json({
      message: "Signed document uploaded and citizen notified",
      document,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to upload signed document",
      error: error.message,
    });
  }
};

// Citizen views and downloads their document
exports.getDocument = async (req, res) => {
  const { documentId } = req.params;

  try {
    const document = await Document.findById(documentId).populate("citizen_id");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ document });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch document", error: error.message });
  }
};
