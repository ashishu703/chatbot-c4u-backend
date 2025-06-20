const WidgetRepository = require("../repositories/ChatWidgetRepository");
const { uploadFile, getFileExtension } = require("../utils/file.utils");
const { generateWhatsAppURL, returnWidget } = require("../utils/widget.utils");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const LogoRequiredException = require("../exceptions/CustomExceptions/LogoRequiredException");
const { generateUid } = require("../utils/auth.utils");
const { UPLOAD } = require("../types/widget-logo.types");
const { backendURI } = require("../config/app.config");

class WidgetService {
  widgetRepository;
  constructor() {
    this.widgetRepository = new WidgetRepository();
  }
  async addWidget(
    uid,
    { title, whatsapp_number, place, selectedIcon, logoType, size },
    files
  ) {
    if (!title || !whatsapp_number || !place) {
      throw new FillAllFieldsException();
    }
    let filename;
    if (logoType === UPLOAD) {
      if (!files || !files.file) {
        throw new LogoRequiredException();
      }
      const file = files.file;
      const randomString = generateUid();
      filename = `${randomString}.${getFileExtension(file.name)}`;
      await uploadFile(
        file,
        path.join(__dirname, "..", "client", "public", "media")
      );
    } else {
      filename = selectedIcon;
    }
    const unique_id = generateUid();
    await this.widgetRepository.create({
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

  async getMyWidget(uid) {
    const widgets = await this.widgetRepository.findByUid(uid);
    return widgets;
  }

  async deleteWidget(id) {
    await this.widgetRepository.delete(id);
    return true;
  }

  async getWidget(id) {
    if (!id) {
      return "";
    }
    const widget = await this.widgetRepository.findByUniqueId(id);
    if (!widget) {
      return "";
    }
    const url = generateWhatsAppURL(widget.whatsapp_number, widget.title);
    return returnWidget(
      `${backendURI}/media/${widget.logo}`,
      widget.size,
      url,
      widget.place
    );
  }
}

module.exports = WidgetService;
