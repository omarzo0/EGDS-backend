const express = require("express");
const { initConfig, Config } = require("./src/config");
const { initDB } = require("./src/database/init");
const { _404Middleware } = require("./src/middleware/404");
const { errorMiddleware } = require("./src/middleware/error");
const citizenRoutes = require("./src/routes/citizen");
const documentRoutes = require("./src/routes/documents");
const documentApplicationRoutes = require("./src/routes/documentApplication");
const adminRoutes = require("./src/routes/admin");
const logRoutes = require("./src/routes/log");
const paymentRoutes = require("./src/routes/payment");
const notificationRoutes = require("./src/routes/notification");
const eSignatureRoutes = require("./src/routes/eSignature");
const feedbackRoutes = require("./src/routes/feedback");
const archiveRoutes = require("./src/routes/archive");

function initRoutes(app) {
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
}

function initMiddlewares(app) {
  app.use(express.json());
}

async function initServer() {
  // Config
  initConfig();

  // Server
  const app = express();

  // DB
  await initDB();

  // Middlewares
  initMiddlewares(app);

  // Routes
  initRoutes(app);

  // 404
  _404Middleware(app);

  // Error
  errorMiddleware(app);

  // Start the server
  const PORT = Config.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

initServer();
