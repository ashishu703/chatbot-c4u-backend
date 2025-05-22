const path = require("path");
const fs = require("fs").promises;
const mime = require("mime-types");

const folderExists = (folderPath) => {
  return fs.existsSync(folderPath);
};

const getFileExtension = (filename) => {
  return filename.split(".").pop();
};

const uploadFile = async (file, destination) => {
  const randomString = randomstring.generate();
  const filename = `${randomString}.${getFileExtension(file.name)}`;
  const filePath = path.join(destination, filename);
  await new Promise((resolve, reject) => {
    file.mv(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  return { filename, filePath };
};

const getFileInfo = async (filePath) => {
  const stats = await fs.stat(filePath);
  const mimeType = mime.lookup(filePath) || "application/octet-stream";
  return {
    fileSizeInBytes: stats.size,
    mimeType,
  };
};

module.exports = { getFileInfo };

const downloadAndExtractFile = async (files, outputPath) => {
  if (!files?.file) {
    return { success: false, msg: "No file provided" };
  }
  const file = files.file;
  const filePath = path.join(outputPath, file.name);
  await new Promise((resolve, reject) => {
    file.mv(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
  return { success: true, msg: "File extracted successfully" };
};

module.exports = {
  folderExists,
  downloadAndExtractFile,
  getFileExtension,
  uploadFile,
  getFileInfo,
};
