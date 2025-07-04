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
const eSignatureRoutes = require("./src/routes/admin/eSignature");
const feedbackRoutes = require("./src/routes/admin/feedback");
const servicesRoutes = require("./src/routes/admin/services");
const NotificationRoutes = require("./src/routes/admin/notification");
const ReminderRoutes = require("./src/routes/admin/reminder");
const paymentRoutes = require("./src/routes/admin/payment");
const ProfileRoutes = require("./src/routes/admin/getme");
const ChatRoutes = require("./src/routes/admin/chat");
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
const citizenPaymentRoutes = require("./src/routes/citizen/payment");
const citizencalendarServiceRoutes = require("./src/routes/citizen/CalendarService"); // Import the service
const citizenNewsRoutes = require("./src/routes/citizen/news"); // Import the service
const citizenCountsRoutes = require("./src/routes/citizen/counts"); // Import the service
const citizenAccountRoutes = require("./src/routes/citizen/account");
const citizenChatRoutes = require("./src/routes/citizen/chat");

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
  app.use("/api/admin", ReminderRoutes);
  app.use("/api/admin", ChatRoutes);

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
  app.use("/api/citizen", citizenPaymentRoutes);
  app.use("/api/citizen", citizencalendarServiceRoutes);
  app.use("/api/citizen", citizenNewsRoutes);
  app.use("/api/citizen", citizenCountsRoutes);
  app.use("/api/citizen", citizenAccountRoutes);
  app.use("/api/citizen", citizenChatRoutes);

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
