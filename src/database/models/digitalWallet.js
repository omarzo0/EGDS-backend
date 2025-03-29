const { required } = require("joi");
const mongoose = require("mongoose");
const { CitizenModel } = require("../../database/models/citizen");

const documentSchema = new mongoose.Schema(
  {
    document_name: { type: String, required: true },
    document_type: {
      type: String,
      enum: [
        "Birth Certificate",
        "National ID",
        "Passport",
        "Marriage Certificate",
        "Death Certificate",
        "Driver's License",
        "others",
      ],
      required: true,
    },
    document_number: { type: String, required: true },
    issue_date: { type: Date, required: true },
    expiry_date: { type: Date, required: true },
    document_image: { type: String, required: true },
    status: {
      type: String,
      enum: ["Issued", "Pending", "Revoked", "finished"],
      required: true,
    },
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
  },
  { timestamps: true }
);
documentSchema.post("save", async function (doc) {
  const citizenId = doc.citizen_id;
  const documents = await DocumentModel.find({ citizen_id: citizenId });

  const allRevoked = documents.every((d) => d.status === "Revoked");
  const anyPending = documents.some((d) => d.status === "Pending");

  let walletStatus = "active";
  if (allRevoked) {
    walletStatus = "suspended";
  } else if (anyPending) {
    walletStatus = "pending";
  }

  await CitizenModel.findByIdAndUpdate(citizenId, {
    wallet_status: walletStatus,
  });
});
const DocumentModel =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

module.exports = DocumentModel;
