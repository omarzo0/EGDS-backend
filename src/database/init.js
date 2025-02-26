const mongoose = require("mongoose");
const { Config } = require("../config");

async function initDB() {
  await mongoose.connect(Config.MONGODB_URI);
}

module.exports = { initDB };
