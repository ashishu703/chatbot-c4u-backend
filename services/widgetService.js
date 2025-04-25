const widgetRepository = require('../repositories/widgetRepository');
const { uploadFile, getFileExtension } = require('../utils/fileUtils');
const { generateWhatsAppURL, returnWidget } = require('../utils/widgetUtils');
const randomstring = require('randomstring');
const path = require('path');

class WidgetService {
  async addWidget(uid, { title, whatsapp_number, place, selectedIcon, logoType, size }, files) {
    if (!title || !whatsapp_number || !place) {
      return { success: false, msg: 'Please fill the details' };
    }
    let filename;
    if (logoType === 'UPLOAD') {
      if (!files || !files.file) {
        return { success: false, msg: 'Please upload a logo' };
      }
      const file = files.file;
      const randomString = randomstring.generate();
      filename = `${randomString}.${getFileExtension(file.name)}`;
      await uploadFile(file, path.join(__dirname, '..', 'client', 'public', 'media'));
    } else {
      filename = selectedIcon;
    }
    const unique_id = randomstring.generate(10);
    await widgetRepository.create({
      unique_id, uid, title, whatsapp_number, logo: filename, place, size: size || 50
    });
    return { success: true, msg: 'Widget was added' };
  }

  async getMyWidget(uid) {
    const widgets = await widgetRepository.findByUid(uid);
    return { success: true, data: widgets };
  }

  async deleteWidget(id) {
    await widgetRepository.delete(id);
    return { success: true, msg: 'Widget was deleted' };
  }

  async getWidget(id) {
    if (!id) {
      return '';
    }
    const widget = await widgetRepository.findByUniqueId(id);
    if (!widget) {
      return '';
    }
    const url = generateWhatsAppURL(widget.whatsapp_number, widget.title);
    return returnWidget(`${process.env.BACKURI}/media/${widget.logo}`, widget.size, url, widget.place);
  }
}

module.exports = new WidgetService();