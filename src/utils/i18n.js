import * as i18next from "i18next";
import Backend from "i18next-fs-backend";
import { join } from "path";

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

export async function changeI18Language(language) {
  await i18next.changeLanguage(language);
}

export function getI18Message(key) {
  return i18next.t(`message.${key}`);
}

export function getI18ValidationMessage(key) {
  return i18next.t(`validation.${key}`);
}

export default i18next;
