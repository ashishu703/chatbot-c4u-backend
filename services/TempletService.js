const TempletRepository = require("../repositories/templetRepository");

class TempletService {
  templetRepository;
  constructor() {
    this.templetRepository = new TempletRepository();
  }

  async addTemplate(uid, { title, type, content }) {
    if (typeof content !== "string") {
      content = JSON.stringify(content);
    }

    await this.templetRepository.create({ uid, title, type, content });
    return true;
  }

  async getTemplates(uid) {
    return await this.templetRepository.findByUid(uid);
  }

  async deleteTemplates(ids) {
    await this.templetRepository.deleteByIds(ids);
    return true;
  }
}

module.exports = TempletService;
