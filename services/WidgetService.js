const WidgetRepository = require("../repositories/widgetRepository");
const { uploadFile, getFileExtension } = require("../utils/fileUtils");
const { generateWhatsAppURL, returnWidget } = require("../utils/widgetUtils");
const randomstring = require("randomstring");
const path = require("path");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const LogoRequiredException = require("../exceptions/CustomExceptions/LogoRequiredException");

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
    if (logoType === "UPLOAD") {
      if (!files || !files.file) {
        throw new LogoRequiredException();
      }
      const file = files.file;
      const randomString = randomstring.generate();
      filename = `${randomString}.${getFileExtension(file.name)}`;
      await uploadFile(
        file,
        path.join(__dirname, "..", "client", "public", "media")
      );
    } else {
      filename = selectedIcon;
    }
    const unique_id = randomstring.generate(10);
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
      `${process.env.BACKURI}/media/${widget.logo}`,
      widget.size,
      url,
      widget.place
    );
  }
}

module.exports = WidgetService;
