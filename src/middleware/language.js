const { i18next } = require("../utils/i18n");

async function changeLanguage(req, res, next) {
  try {
    await i18next.changeLanguage(req.lang);
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  changeLanguage,
};
