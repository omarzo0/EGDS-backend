const express = require("express");
const {
  createDocumentApplication,
  getAllDocumentApplications,
  getDocumentApplicationById,
  updateDocumentApplicationStatus,
  deleteDocumentApplication,
} = require("../Controller/documentApplication");

const router = express.Router();

// Define routes
router.post("/", createDocumentApplication);
router.get("/", getAllDocumentApplications);
router.get("/:id", getDocumentApplicationById);
router.put("/:id", updateDocumentApplicationStatus);
router.delete("/:id", deleteDocumentApplication);

module.exports = router;
