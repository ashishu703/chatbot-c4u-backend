const TempletRepository = require("../repositories/templetRepository");

class TempletService {
  constructor() {
    this.templetRepository = new TempletRepository();
  }

  async addTemplate(uid, { title, type, content }) {
    if (typeof content !== "string") {
      content = JSON.stringify(content);
    }

    return this.templetRepository.create({ uid, title, type, content });
  }

  async getTemplates(uid) {
    return this.templetRepository.findByUid(uid);
  }

  async deleteTemplates(ids) {
    return this.templetRepository.deleteByIds(ids);
  }
}

module.exports = TempletService;
