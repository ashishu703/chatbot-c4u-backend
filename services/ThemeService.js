const fs = require("fs");
const path = require("path");
const ThemeSettingErrorException = require("../exceptions/CustomExceptions/ThemeSettingErrorException");

class ThemeService {
  async getTheme() {
    const filePath = path.join(__dirname, "..", "theme.json");
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, lang) => {
        if (err) {
          reject(new ThemeSettingErrorException());
        } else {
          resolve({ data: JSON.parse(lang) });
        }
      });
    });
  }

  async saveTheme(updatedJson) {
    const filePath = path.join(__dirname, "..", "theme.json");
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(updatedJson), "utf8", (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
}

module.exports = ThemeService;
