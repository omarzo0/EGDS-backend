const { config } = require("dotenv");
const { existsSync, mkdirSync } = require("node:fs");
const { join } = require("node:path");

const Dirs = ["uploads"];

function CreateDir() {
  for (const dir of Dirs) {
    const path = join(__dirname, "..", "..", dir);
    if (existsSync(path)) continue;
    mkdirSync(path, { recursive: true });
  }
}

function initConfig() {
  config();
  CreateDir;
}

const Config = {
  PORT: process.env["PORT"],
  MONGODB_URI: process.env["MONGODB_URI"],
};

module.exports = {
  initConfig,
  Config,
};
