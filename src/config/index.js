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
  EMAIL_HOST: process.env["EMAIL_HOST"],
  EMAIL_PORT: process.env["EMAIL_PORT"],
  EMAIL_SECURE: process.env["EMAIL_SECURE"],
  EMAIL_USER: process.env["EMAIL_USER"],
  EMAIL_PASSWORD: process.env["EMAIL_PASSWORD"],
  EMAIL_FROM_NAME: process.env["EMAIL_FROM_NAME"],
  EMAIL_FROM_ADDRESS: process.env["EMAIL_FROM_ADDRESS"],
  STRIPE_SECRET_KEY: process.env["STRIPE_SECRET_KEY"],
  STRIPE_PUBLISHABLE_KEY: process.env["STRIPE_PUBLISHABLE_KEY"],
  CALENDARIFIC_API_KEY: process.env["CALENDARIFIC_API_KEY"],

  ENCRYPTION_KEY: process.env["ENCRYPTION_KEY"],

  TWILIO_ACCOUNT_SID: process.env["TWILIO_ACCOUNT_SID"],
  TWILIO_AUTH_TOKEN: process.env["TWILIO_AUTH_TOKEN"],
  
};


module.exports = {
  initConfig,
  Config,
};
