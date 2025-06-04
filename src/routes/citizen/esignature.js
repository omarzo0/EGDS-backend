const express = require("express");
const multer = require("multer"); // Import multer
const {
  getAllEpapers,
  downloadEpaper,
  createEpaper,
  deleteEpaper,
  getAvailableESignServices,
  getESignServicesByDepartment,
} = require("../../controller/citizen/esignature.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the directory where uploaded files will be stored
    // Make sure this directory exists or create it programmatically
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Define how the file will be named
    // You might want to add a timestamp to prevent name collisions
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Get all e-signature papers
router.get(
  "/esignature/:id",
  //citizenIsAuth, // Uncomment when ready to enforce authentication
  changeLanguage,
  getAllEpapers
);

router.get(
  "/esignature_download/:signed_id",
  //citizenIsAuth, // Uncomment when ready to enforce authentication
  changeLanguage,
  downloadEpaper
);

router.get(
  "/esignature-services",
  //citizenIsAuth, // Uncomment when ready to enforce authentication
  changeLanguage,
  getAvailableESignServices
);
router.get(
  "/esignature-services/:department_id",
  changeLanguage,
  getESignServicesByDepartment
);

// Create e-signature paper
router.post(
  "/esignature",
  //citizenIsAuth, // Uncomment when ready to enforce authentication
  changeLanguage,
  upload.single('uploaded_document'), // <-- Add Multer middleware here
  createEpaper
);

// Delete e-signature paper
router.delete(
  "/esignature/:id",
  //citizenIsAuth, // Uncomment when ready to enforce authentication
  changeLanguage,
  deleteEpaper
);

module.exports = router;