require("dotenv").config();
const IntlMessageFormat = require("intl-messageformat").default;

const translations = {
  en: require("../locales/en.json"),
  fr: require("../locales/fr.json"),
};

const locale = process.env.LOCALE;

function __t(key, values = {}) {
  const msg = new IntlMessageFormat(translations[locale][key], locale);
  return msg.format(values);
}

module.exports = {
  __t,
};
