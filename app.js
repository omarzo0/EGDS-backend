const express = require("express");
const cors = require("cors");

const { initConfig, Config } = require("./src/config");
const { initDB } = require("./src/database/init");
const { _404Middleware } = require("./src/middleware/404");
const { errorMiddleware } = require("./src/middleware/error");
const authRoutes = require("./src/routes/admin/auth");
const adminRoutes = require("./src/routes/admin/admin");
const citizenRoutes = require("./src/routes/admin/citizen");
const documentRoutes = require("./src/routes/admin/document");
const departmentRoutes = require("./src/routes/admin/department");
const eSignatureRoutes = require("./src/routes/admin/esignature");
const feedbackRoutes = require("./src/routes/admin/feedback");
const servicesRoutes = require("./src/routes/admin/services");
const NotificationRoutes = require("./src/routes/admin/notification");
const ReminderRoutes = require("./src/routes/admin/reminder");
const paymentRoutes = require("./src/routes/admin/payment");
const billsRoutes = require("./src/routes/admin/bills");
const ProfileRoutes = require("./src/routes/admin/getme");
const digitalwalletRoutes = require("./src/routes/admin/digitalwallet");
const pointRoutes = require("./src/routes/admin/point");
const citizenAuthRoutes = require("./src/routes/citizen/auth");
const citizenDocumentRoutes = require("./src/routes/citizen/document");
const citizenEsignatureRoutes = require("./src/routes/citizen/esignature");
const citizenFeedbackRoutes = require("./src/routes/citizen/feedback");
const citizenDepartmentRoutes = require("./src/routes/citizen/department");
const citizenPointsRoutes = require("./src/routes/citizen/points");
const citizenWalletRoutes = require("./src/routes/citizen/wallet");
const citizenServicesRoutes = require("./src/routes/citizen/services");
const citizenDigitalDocumentRoutes = require("./src/routes/citizen/digitalwallet");
const citizenNotificationRoutes = require("./src/routes/citizen/notification");

function initRoutes(app) {
  // Admin
  app.use("/api/admin", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/admin", citizenRoutes);
  app.use("/api/admin", documentRoutes);
  app.use("/api/admin", eSignatureRoutes);
  app.use("/api/admin", feedbackRoutes);
  app.use("/api/admin", NotificationRoutes);
  app.use("/api/admin", pointRoutes);
  app.use("/api/admin", departmentRoutes);
  app.use("/api/admin", servicesRoutes);
  app.use("/api/admin", digitalwalletRoutes);
  app.use("/api/admin", ProfileRoutes);
  app.use("/api/admin", paymentRoutes);
  app.use("/api/admin", billsRoutes);
  app.use("/api/admin", ReminderRoutes);

  // Citizen
  app.use("/api/citizen", citizenAuthRoutes);
  app.use("/api/citizen", citizenDocumentRoutes);
  app.use("/api/citizen", citizenEsignatureRoutes);
  app.use("/api/citizen", citizenFeedbackRoutes);
  app.use("/api/citizen", citizenPointsRoutes);
  app.use("/api/citizen", citizenWalletRoutes);
  app.use("/api/citizen", citizenDepartmentRoutes);
  app.use("/api/citizen", citizenServicesRoutes);
  app.use("/api/citizen", citizenDigitalDocumentRoutes);
  app.use("/api/citizen", citizenNotificationRoutes);
  // Test
  app.get("/api/test", (req, res) => {
    res.send("Server is running......");
  });
}
if (process.env.NODE_ENV !== "test") {
  require("./src/utils/expirationChecker");
}
function initMiddlewares(app) {
  app.use(cors());
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
  const PORT = Config.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

initServer();
