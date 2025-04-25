const fs = require('fs');
const path = require('path');

class ThemeService {
  async getTheme() {
    const filePath = path.join(__dirname, '..', 'theme.json');
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, lang) => {
        if (err) {
          reject(new Error('Something went wrong with the theme setting'));
        } else {
          resolve({ success: true, data: JSON.parse(lang) });
        }
      });
    });
  }

  async saveTheme(updatedJson) {
    const filePath = path.join(__dirname, '..', 'theme.json');
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(updatedJson), 'utf8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true, msg: 'Theme was updated' });
        }
      });
    });
  }
}

module.exports = new ThemeService();