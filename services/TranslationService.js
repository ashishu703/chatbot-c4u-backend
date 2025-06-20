const fs = require("fs");
const path = require("path");
const DestinationFileExistsException = require("../exceptions/CustomExceptions/DestinationFileExistsException");
const CannotDeleteAllLanguagesException = require("../exceptions/CustomExceptions/CannotDeleteAllLanguagesException");
class TranslationService {
  async getOneTranslation(code) {
    const cirDir = process.cwd();
    const filePath = path.join(cirDir, "languages", `${code}.json`);
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, lang) => {
        if (err) {
          resolve({ notfound: true });
        } else {
          resolve({ data: JSON.parse(lang) });
        }
      });
    });
  }

  async getAllTranslationNames() {
    const cirDir = process.cwd();
    const folderPath = path.join(cirDir, "languages");
    return new Promise((resolve, reject) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve({ data: files });
        }
      });
    });
  }

  async updateTranslation(code, updatedJson) {
    const cirDir = process.cwd();
    const filePath = path.join(cirDir, "languages", `${code}.json`);
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

  async addNewTranslation(newCode) {
    const cirDir = process.cwd();
    const sourceFolderPath = path.join(cirDir, "languages");
    return new Promise((resolve, reject) => {
      fs.readdir(sourceFolderPath, (err, files) => {
        if (err) {
          reject(err);
          return;
        }
        const jsonFiles = files.filter((file) => file.endsWith(".json"));
        const randomIndex = Math.floor(Math.random() * jsonFiles.length);
        const randomFile = jsonFiles[randomIndex];
        const sourceFilePath = path.join(sourceFolderPath, randomFile);
        const destinationFilePath = path.join(
          sourceFolderPath,
          `${newCode}.json`
        );
        if (fs.existsSync(destinationFilePath)) {
          resolve(new DestinationFileExistsException());
          return;
        }
        fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    });
  }

  async deleteTranslation(code) {
    const cirDir = process.cwd();
    const folderPath = path.join(cirDir, "languages");
    const filePath = path.join(folderPath, `${code}.json`);
    return new Promise((resolve, reject) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          reject(err);
          return;
        }
        const jsonFiles = files.filter((file) => file.endsWith(".json"));
        if (jsonFiles.length === 1) {
          resolve(new CannotDeleteAllLanguagesException());
          return;
        }
        fs.unlink(filePath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    });
  }
}

module.exports = TranslationService;
