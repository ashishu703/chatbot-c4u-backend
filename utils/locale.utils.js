require("dotenv").config();
const IntlMessageFormat = require("intl-messageformat").default;

const translations = {
  en: require("../locales/en.json"),
  fr: require("../locales/fr.json"),
};

const locale = process.env.LOCALE || 'en'; 

function __t(key, values = {}) {
  const translationString = translations[locale] && translations[locale][key];
  
  if (!translationString) {
    return key; 
  }

  const msg = new IntlMessageFormat(translationString, locale);
  return msg.format(values);
}

module.exports = {
  __t,
};
