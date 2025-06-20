const fs = require("fs");
const path = require("path");
const { getFileExtension } = require("../utils/file.utils");
const { generateUid } = require("../utils/auth.utils");
const { backendURI } = require("../config/app.config");

class FileService {
  async uploadFile(file) {
    const randomString = generateUid();
    const filename = `${randomString}.${getFileExtension(file.name)}`;
    const uploadDir = path.join(__dirname, "../client/public/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadPath = path.join(uploadDir, filename);

    await new Promise((resolve, reject) => {
      file.mv(uploadPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return filename;
  }

  async uploadMedia(file) {
    const randomString = generateUid();
    const filename = `${randomString}.${getFileExtension(file.name)}`;
    const mediaDir = path.join(__dirname, "../client/public/media");

    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }

    const uploadPath = path.join(mediaDir, filename);
    await new Promise((resolve, reject) => {
      file.mv(uploadPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return `${backendURI}/media/${filename}`;
  }
}

module.exports = FileService;
