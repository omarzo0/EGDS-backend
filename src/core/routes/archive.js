const express = require("express");
const router = express.Router();
const { archiveAndFetchDocuments } = require("../Controller/archive");

router.put("/archive/:documentId?", archiveAndFetchDocuments);

module.exports = router;
