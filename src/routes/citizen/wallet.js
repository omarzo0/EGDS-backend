const express = require("express");
const {
  getAllWalletDocuments,
  createWalletDocument,
  updateWalletDocument,
  deleteWalletDocument,
} = require("../../controller/citizen/wallet.js");
const { changeLanguage } = require("../../middleware/language");
const { citizenIsAuth } = require("../../middleware/auth");

const router = express.Router();

// Get all wallet documents
router.get("/wallet", citizenIsAuth, changeLanguage, getAllWalletDocuments);

// Create wallet document
router.post("/wallet", citizenIsAuth, changeLanguage, createWalletDocument);

// Update wallet document
router.put("/wallet/:id", citizenIsAuth, changeLanguage, updateWalletDocument);

// Delete wallet document
router.delete(
  "/wallet/:id",
  citizenIsAuth,
  changeLanguage,
  deleteWalletDocument
);

module.exports = router;
