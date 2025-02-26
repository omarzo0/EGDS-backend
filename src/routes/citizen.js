const express = require("express");
const {
  createCitizen,
  getAllCitizens,
  getCitizenById,
  updateCitizenById,
  deleteCitizenById,
} = require("../Controller/citizen");

const router = express.Router();

// Define routes
router.post("/", createCitizen);
router.get("/", getAllCitizens);
router.get("/:id", getCitizenById);
router.put("/:id", updateCitizenById);
router.delete("/:id", deleteCitizenById);

module.exports = router;
