const express = require("express");
const { initConfig, Config } = require("./src/config");
const { initDB } = require("./src/database/init");
const { _404Middleware } = require("./src/middleware/404");
const { errorMiddleware } = require("./src/middleware/error");
const authRoutes = require("./src/routes/admin/auth");
const adminRoutes = require("./src/routes/admin/admin");
const citizenRoutes = require("./src/routes/admin/citizen");
const documentRoutes = require("./src/routes/admin/document");
const eSignatureRoutes = require("./src/routes/admin/eSignature");
const feedbackRoutes = require("./src/routes/admin/feedback");
const logRoutes = require("./src/routes/admin/log");
const pointRoutes = require("./src/routes/admin/point");

function initRoutes(app) {
  // Admin
  app.use("/api/admin", authRoutes);
  app.use("/api/admin/admin", adminRoutes);
  app.use("/api/admin/citizen", citizenRoutes);
  app.use("/api/admin/document", documentRoutes);
  app.use("/api/admin/signature", eSignatureRoutes);
  app.use("/api/admin/feedback", feedbackRoutes);
  app.use("/api/admin/log", logRoutes);
  app.use("/api/admin/point", pointRoutes);

  // Citizen

  // Test
  app.get("/api/test", (req, res) => {
    res.send("Server is running......");
  });
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
