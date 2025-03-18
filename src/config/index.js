const { config } = require("dotenv");
config();
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
  CreateDir();
}

const Config = {
  PORT: process.env["PORT"],
  MONGODB_URI: process.env["MONGODB_URI"],
  JWT_ADMIN_SECRET: process.env["JWT_ADMIN_SECRET"],
  JWT_CITIZEN_SECRET: process.env["JWT_CITIZEN_SECRET"],
  JWT_ADMIN_SECRET_EXP: process.env["JWT_ADMIN_SECRET_EXP"],
  JWT_CITIZEN_SECRET_EXP: process.env["JWT_CITIZEN_SECRET_EXP"],
};

module.exports = {
  initConfig,
  Config,
};
