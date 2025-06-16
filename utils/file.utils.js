const path = require("path");
const fs = require("fs").promises;
const mime = require("mime-types");
const { generateUid } = require("./auth.utils");

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

async function deleteFileIfExists(filePath) {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`File ${filePath} has been deleted.`);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error(`Error deleting file ${filePath}:`, err);
      throw err;
    }
  }
}


async function uploadMetaFiles(file) {
  const randomString = generateUid();
  const filename = `${randomString}.${getFileExtension(file.name)}`;
  await file.mv(`${__dirname}/../client/public/media/${filename}`);
  const directory = `${__dirname}/../client/public/media/${filename}`
  return {
    filename,
    directory
  }
}

module.exports = {
  folderExists,
  downloadAndExtractFile,
  getFileExtension,
  uploadFile,
  deleteFileIfExists,
  getFileInfo,
  uploadMetaFiles
};
