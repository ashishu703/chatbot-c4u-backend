const CustomException = require("../CustomException");

class ThemeSettingErrorException extends CustomException {
  constructor() {
    super("ThemeSettingErrorException");
  }
}

module.exports = ThemeSettingErrorException;
