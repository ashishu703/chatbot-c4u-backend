const path = require("path");
const NoFilesWereUploadedException = require("../exceptions/CustomExceptions/NoFilesWereUploadedException");
const { generateUid } = require("../utils/auth.utils");
function getFileExtension(filename) {
  return filename.split(".").pop();
}

class MediaService {
  async handleMediaUpload(files) {
    if (!files || Object.keys(files).length === 0) {
      throw new NoFilesWereUploadedException();
    }

    const randomString = generateUid();
    const file = files.file;
    const filename = `${randomString}.${getFileExtension(file.name)}`;
    const filePath = path.join(__dirname, "../client/public/media", filename);

    await new Promise((resolve, reject) => {
      file.mv(filePath, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const url = `${process.env.BACKURI}/media/${filename}`;
    return { success: true, url };
  }
}

module.exports = MediaService;
