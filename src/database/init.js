const Config = require("@/config");
const mongoose = require("mongoose");

async function initDB() {
  await mongoose.connect(Config.MONGODB_URI);
}

module.exports = { initDB };
