const DocumentApplication = require("../../database/models/DocumentApplication");

// Create a new document application
const createDocumentApplication = async (req, res) => {
  try {
    const {
      citizen_id,
      document_type,
      application_date,
      status,
      rejection_reason,
    } = req.body;

    const newApplication = new DocumentApplication({
      citizen_id,
      document_type,
      application_date,
      status,
      rejection_reason,
    });

    const savedApplication = await newApplication.save();
    res.status(201).json(savedApplication);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all document applications
const getAllDocumentApplications = async (req, res) => {
  try {
    const applications = await DocumentApplication.find().populate(
      "citizen_id",
      "first_name last_name"
    );
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a document application by ID
const getDocumentApplicationById = async (req, res) => {
  try {
    const application = await DocumentApplication.findById(
      req.params.id
    ).populate("citizen_id", "first_name last_name");

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update document application status
const updateDocumentApplicationStatus = async (req, res) => {
  try {
    const { status, approval_date, rejection_reason } = req.body;

    const updatedApplication = await DocumentApplication.findByIdAndUpdate(
      req.params.id,
      { status, approval_date, rejection_reason },
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.status(200).json(updatedApplication);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a document application
const deleteDocumentApplication = async (req, res) => {
  try {
    const deletedApplication = await DocumentApplication.findByIdAndDelete(
      req.params.id
    );

    if (!deletedApplication) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.status(200).json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createDocumentApplication,
  getAllDocumentApplications,
  getDocumentApplicationById,
  updateDocumentApplicationStatus,
  deleteDocumentApplication,
};
