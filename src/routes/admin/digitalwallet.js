const express = require("express");
const { changeLanguage } = require("../../middleware/language");
const { adminAllowedTo, adminIsAuth } = require("../../middleware/auth");
const { AdminRole } = require("../../database/models/admin");
const {
  getAllDigitalDocument,
  UpdateDigitalDocumentStatus,
  deleteDigitalDocument,
  deleteDigitalWallet,
  getDigitalWalletStatistics,
  suspendDigitalWallet,
  unsuspendDigitalWallet,
  getDigitalWalletById,
} = require("../../controller/admin/digitalwallet");

const router = express.Router();

router.get(
  "/digital-document",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  getAllDigitalDocument
);
router.get(
  "/digital-wallet-details/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  getDigitalWalletById
);

router.get(
  "/admin/statistics/digital-wallets",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  getDigitalWalletStatistics
);

router.put(
  "/digital-document/:id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  UpdateDigitalDocumentStatus
);
router.delete(
  "/documents/:document_id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  deleteDigitalDocument
);
router.delete(
  "/admin/wallets/:citizen_id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN]),
  deleteDigitalWallet
);
router.put(
  "/wallet/suspend/:citizen_id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  suspendDigitalWallet
);

router.put(
  "/wallet/unsuspend/:citizen_id",
  // adminIsAuth,
  // changeLanguage,
  // adminAllowedTo([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  unsuspendDigitalWallet
);
module.exports = router;
