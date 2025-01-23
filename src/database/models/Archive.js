const mongoose = require("mongoose");

const archiveSchema = new mongoose.Schema({
  citizen_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Citizen",
    required: true,
  },
  document_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  archive_date: { type: Date, required: true },
  remarks: { type: String },
});

const Archive = mongoose.model("Archive", archiveSchema);

module.exports = Archive;
