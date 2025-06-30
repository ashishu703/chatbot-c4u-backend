const randomstring = require("randomstring");
const path = require("path");
const ChatWidgetRepository = require("../repositories/ChatWidgetRepository");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const LogoRequiredException = require("../exceptions/CustomExceptions/LogoRequiredException");
const { UPLOAD } = require("../types/widget-logo.types");
const { generateUid } = require("../utils/auth.utils");
const { getFileExtension } = require("../utils/validation.utils");
class ChatWidgetService {

  constructor() {
    this.chatWidgetRepository = new ChatWidgetRepository();
  }

  async addWidget(req) {
    const { title, whatsapp_number, place, selectedIcon, logoType, size } =
      req.body;
    const uid = req.decode.uid;

    if (!title || !whatsapp_number || !place) {
      throw new FillAllFieldsException();
    }

    let filename;

    if (logoType === UPLOAD) {
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new LogoRequiredException();
      }

      const randomString = randomstring.generate();
      const file = req.files.file;
      filename = `${randomString}.${getFileExtension(file.name)}`;

      await new Promise((resolve, reject) => {
        file.mv(
          path.join(__dirname, `../client/public/media/${filename}`),
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    } else {
      filename = selectedIcon;
    }

    const unique_id = generateUid();

    await this.chatWidgetRepository.create({
      unique_id,
      uid,
      title,
      whatsapp_number,
      logo: filename,
      place,
      size: size || 50,
    });

    return true;
  }
  async getMyWidgets(uid, query) {
    return this.chatWidgetRepository.paginate({ where: { uid }, ...query });
  }

  async deleteWidget(id) {
    return this.chatWidgetRepository.deleteChatWidget(id);
  }
}

module.exports = ChatWidgetService;
