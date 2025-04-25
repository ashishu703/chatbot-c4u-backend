const path = require("path");
const randomstring = require("randomstring");
const { getFileExtension } = require("../functions/function");

class FileService {
  static async uploadMedia(file) {
    const randomString = randomstring.generate();
    const filename = `${randomString}.${getFileExtension(file.name)}`;
    const uploadPath = path.join(__dirname, "../client/public/media", filename);
    await new Promise((resolve, reject) => {
      file.mv(uploadPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    return `${process.env.BACKURI}/media/${filename}`;
  }

  static async uploadFile(file) {
    const randomString = randomstring.generate();
    const filename = `${randomString}.${getFileExtension(file.name)}`;
    const uploadPath = path.join(__dirname, "../client/public/uploads", filename);
    await new Promise((resolve, reject) => {
      file.mv(uploadPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    return filename;
  }
}

module.exports = FileService;