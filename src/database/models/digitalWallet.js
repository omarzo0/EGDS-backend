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
      default: "Pending",
      required: true,
    },
    citizen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
    expiration_status: {
      type: String,
      enum: ["Valid", "Expires Soon", "Expired"],
      default: "Valid",
    },
    reminder_sent: {
      type: Boolean,
      default: false,
    },
    last_reminder_sent: {
      type: Date,
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

// In your document model file
documentSchema.pre("save", function (next) {
  updateExpirationStatus(this);
  next();
});

// Add a static method to update expiration status when querying
documentSchema.statics.updateExpirationStatus = function (document) {
  return updateExpirationStatus(document);
};

// Helper function to update expiration status
function updateExpirationStatus(doc) {
  const now = new Date();
  const expiryDate = new Date(doc.expiry_date);
  const timeDiff = expiryDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysDiff <= 0) {
    doc.expiration_status = "Expired";
  } else if (daysDiff <= 30) {
    doc.expiration_status = "Expires Soon";

    // Reminder logic remains the same
    const shouldSendReminder =
      !doc.reminder_sent ||
      (doc.last_reminder_sent &&
        now - new Date(doc.last_reminder_sent) > 7 * 24 * 60 * 60 * 1000);

    if (shouldSendReminder && doc.citizen_id) {
      doc.reminder_sent = true;
      doc.last_reminder_sent = now;

      CitizenModel.findById(doc.citizen_id)
        .then((citizen) => {
          if (citizen && citizen.email) {
            sendReminderEmail(
              {
                document_name: doc.document_name,
                document_type: doc.document_type,
                document_number: doc.document_number,
                days_remaining: daysDiff,
              },
              citizen.email
            );
          }
        })
        .catch((err) =>
          console.error("Error sending automatic reminder:", err)
        );
    }
  } else {
    doc.expiration_status = "Valid";
  }

  return doc;
}
const DocumentModel =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

module.exports = DocumentModel;
