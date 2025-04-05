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
  const now = new Date();
  const expiryDate = new Date(this.expiry_date);
  const timeDiff = expiryDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysDiff <= 0) {
    this.expiration_status = "Expired";
  } else if (daysDiff <= 30) {
    this.expiration_status = "Expires Soon";

    // Send automatic reminder if not already sent or if it's been a while
    const shouldSendReminder =
      !this.reminder_sent ||
      (this.last_reminder_sent &&
        now - new Date(this.last_reminder_sent) > 7 * 24 * 60 * 60 * 1000); // 1 week

    if (shouldSendReminder && this.citizen_id) {
      // In a real app, you might want to queue this instead of doing it synchronously
      this.reminder_sent = true;
      this.last_reminder_sent = now;

      // Get citizen email (in a real app, you'd populate this)
      CitizenModel.findById(this.citizen_id)
        .then((citizen) => {
          if (citizen && citizen.email) {
            sendReminderEmail(
              {
                document_name: this.document_name,
                document_type: this.document_type,
                document_number: this.document_number,
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
    this.expiration_status = "Valid";
  }

  next();
});
const DocumentModel =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

module.exports = DocumentModel;
