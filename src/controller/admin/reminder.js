const DocumentModel = require("../../database/models/digitalWallet");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendReminderEmail = async (documentData, recipientEmail) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: recipientEmail,
      subject: `Urgent: ${documentData.document_name} Expires in ${documentData.days_remaining} Days`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">E-Government Documentation System</h2>
          <p>Dear Citizen,</p>
          
          <p>Your <strong>${documentData.document_name}</strong> 
          (${documentData.document_type}) will expire in 
          <strong style="color: ${
            documentData.days_remaining <= 7 ? "#e74c3c" : "#3498db"
          }">
            ${documentData.days_remaining} days
          </strong>.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
            <p><strong>Document Details:</strong></p>
            <p>Type: ${documentData.document_type}</p>
            <p>Number: ${documentData.document_number}</p>
            <p>Status: ${
              documentData.days_remaining <= 0 ? "EXPIRED" : "ACTIVE"
            }</p>
          </div>
          
          <p>Please renew your document before the expiry date to avoid service interruptions.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            ${process.env.EMAIL_FROM_NAME}
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Brevo Email Error:", error);
    return false;
  }
};
const getDocumentsWithStats = async (req, res) => {
  try {
    // Get all documents with population
    const documents = await DocumentModel.find({})
      .populate(
        "citizen_id",
        "first_name last_name email national_id wallet_status"
      )
      .sort({ expiry_date: 1 })
      .lean();

    const now = new Date();
    const validatedDocuments = documents.map((doc) => {
      // Ensure expiry_date is a Date object
      const expiryDate = new Date(doc.expiry_date);
      const timeDiff = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Recalculate expiration_status to ensure consistency
      let expirationStatus = doc.expiration_status;
      if (daysRemaining <= 0) {
        expirationStatus = "Expired";
      } else if (daysRemaining <= 30) {
        expirationStatus = "Expires Soon";
      } else {
        expirationStatus = "Valid";
      }

      return {
        ...doc,
        expiration_status: expirationStatus,
        days_remaining: daysRemaining,
        days_text:
          daysRemaining <= 0
            ? "Expired"
            : `Expires in ${daysRemaining} day${
                daysRemaining !== 1 ? "s" : ""
              }`,
      };
    });

    // Calculate statistics
    const stats = {
      total: validatedDocuments.length,
      valid: validatedDocuments.filter((d) => d.expiration_status === "Valid")
        .length,
      expires_soon: validatedDocuments.filter(
        (d) => d.expiration_status === "Expires Soon"
      ).length,
      expired: validatedDocuments.filter(
        (d) => d.expiration_status === "Expired"
      ).length,
      byType: {},
    };

    // Calculate stats by document type
    const documentTypes = [
      ...new Set(validatedDocuments.map((d) => d.document_type)),
    ];
    documentTypes.forEach((type) => {
      const typeDocs = validatedDocuments.filter(
        (d) => d.document_type === type
      );
      stats.byType[type] = {
        total: typeDocs.length,
        valid: typeDocs.filter((d) => d.expiration_status === "Valid").length,
        expires_soon: typeDocs.filter(
          (d) => d.expiration_status === "Expires Soon"
        ).length,
        expired: typeDocs.filter((d) => d.expiration_status === "Expired")
          .length,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        documents: validatedDocuments,
        stats,
        validation: {
          valid_status_count: validatedDocuments.length, // All should be valid now
          total_documents: validatedDocuments.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching documents with stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};
const sendManualReminders = async (req, res) => {
  try {
    const { documentIds } = req.body;

    if (!documentIds || !Array.isArray(documentIds)) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of document IDs",
      });
    }

    const documents = await DocumentModel.find({
      _id: { $in: documentIds },
    }).populate("citizen_id", "email first_name last_name");

    const now = new Date();
    const results = await Promise.all(
      documents.map(async (doc) => {
        try {
          if (!doc.citizen_id || !doc.citizen_id.email) {
            return {
              documentId: doc._id,
              success: false,
              message: "No email associated with this document",
            };
          }

          const expiryDate = new Date(doc.expiry_date);
          const daysRemaining = Math.ceil(
            (expiryDate - now) / (1000 * 60 * 60 * 24)
          );

          const emailSent = await sendReminderEmail(
            {
              document_name: doc.document_name,
              document_type: doc.document_type,
              document_number: doc.document_number,
              days_remaining: daysRemaining,
            },
            doc.citizen_id.email
          );

          if (emailSent) {
            // Update the document to mark reminder as sent
            await DocumentModel.findByIdAndUpdate(doc._id, {
              reminder_sent: true,
              last_reminder_sent: now,
            });

            return {
              documentId: doc._id,
              success: true,
              message: "Reminder sent successfully",
            };
          } else {
            return {
              documentId: doc._id,
              success: false,
              message: "Failed to send reminder email",
            };
          }
        } catch (error) {
          return {
            documentId: doc._id,
            success: false,
            message: error.message,
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      results,
      message: "Reminder process completed",
    });
  } catch (error) {
    console.error("Error sending manual reminders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reminders",
      error: error.message,
    });
  }
};

module.exports = {
  getDocumentsWithStats,
  sendManualReminders,
};
