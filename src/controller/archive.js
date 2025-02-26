const Document = require("../../database/models/Document");

exports.archiveAndFetchDocuments = async (req, res) => {
  try {
    const { documentId } = req.params;

    if (documentId) {
      const archivedDocument = await Document.findByIdAndUpdate(
        documentId,
        { status: "Archived" },
        { new: true }
      );

      if (!archivedDocument) {
        return res
          .status(404)
          .json({ success: false, message: "Document not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Document archived successfully",
        document: archivedDocument,
      });
    }

    const archivedDocuments = await Document.find({
      status: "Archived",
    }).populate("citizen_id", "first_name last_name");

    res.status(200).json({
      success: true,
      archivedDocuments,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
