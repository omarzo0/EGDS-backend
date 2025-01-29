const express = require("express");
const bodyParser = require("body-parser");
const citizenRoutes = require("./src/core/routes/citizen");
const documentRoutes = require("./src/core/routes/documents");
const documentApplicationRoutes = require("./src/core/routes/documentApplication");
const adminRoutes = require("./src/core/routes/admin");
const logRoutes = require("./src/core/routes/log");
const paymentRoutes = require("./src/core/routes/payment");
const notificationRoutes = require("./src/core/routes/notification");
const eSignatureRoutes = require("./src/core/routes/eSignature");
const feedbackRoutes = require("./src/core/routes/feedback");
const archiveRoutes = require("./src/core/routes/archive");

const connectDB = require("../EGDS-backend/src/config/db");
require("dotenv").config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/citizens", citizenRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/document-applications", documentApplicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/eSignature", eSignatureRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/archive", archiveRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
