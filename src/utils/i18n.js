const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const { join } = require("path");

i18next.use(Backend).init({
  lng: "en",
  defaultNS: "translation",
  fallbackLng: "en",
  backend: {
    loadPath: join(
      __dirname,
      "..",
      "..",
      "..",
      "locales",
      "{{lng}}",
      "{{ns}}.json"
    ),
  },
  interpolation: {
    escapeValue: false,
  },
});

async function changeI18Language(language) {
  await i18next.changeLanguage(language);
}

function getI18Message(key) {
  return i18next.t(`message.${key}`);
}

function getI18ValidationMessage(key) {
  return i18next.t(`validation.${key}`);
}

module.exports = {
  changeI18Language,
  getI18Message,
  getI18ValidationMessage,
  i18next,
};
