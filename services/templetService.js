const TempletRepository = require("../repositories/templetRepository");

class TempletService {
  static async addTemplate(uid, { title, type, content }) {
    await TempletRepository.create({ uid, title, type, content });
    return { success: true, msg: "Template was added" };
  }

  static async getTemplates(uid) {
    return await TempletRepository.findByUid(uid);
  }

  static async deleteTemplates(ids) {
    await TempletRepository.deleteByIds(ids);
    return { success: true, msg: "Template(s) were deleted" };
  }
}

module.exports = TempletService;