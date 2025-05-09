const randomstring = require("randomstring");
const path = require("path");
const chatWidgetRepository = require("../repositories/chatWidgetRepository");
const getFileExtension = require("../functions/function");

class ChatWidgetService {

  async addWidget(req) {
    const { title, whatsapp_number, place, selectedIcon, logoType, size } = req.body;
    const uid = req.decode.uid;

    if (!title || !whatsapp_number || !place) {
      throw new Error("Please fill the details");
    }

    let filename;

    if (logoType === "UPLOAD") {
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error("Please upload a logo");
      }

      const randomString = randomstring.generate();
      const file = req.files.file;
      filename = `${randomString}.${getFileExtension(file.name)}`;

      await new Promise((resolve, reject) => {
        file.mv(path.join(__dirname, `../client/public/media/${filename}`), (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    } else {
      filename = selectedIcon;
    }

    const unique_id = randomstring.generate(10);

    await chatWidgetRepository.create({
      unique_id,
      uid,
      title,
      whatsapp_number,
      logo: filename,
      place,
      size: size || 50,
    });

    return { msg: "Widget was added", success: true };
  }
  async getMyWidgets(uid) {
    try {
      const widgets = await chatWidgetRepository.findByUid(uid);
      return { success: true, data: widgets };
    } catch (error) {
      throw new Error('Failed to fetch widgets: ' + error.message);
    }
  }

  async deleteWidget(id) {
    try {
      await chatWidgetRepository.delete(id);
      return { success: true, msg: 'Widget deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete widget: ' + error.message);
    }
  }
}

module.exports = ChatWidgetService;
