const { GenLink } = require("../models/gen_links");

class LinkRepository {
  static async getGeneratedLinks() {
    return await GenLink.findAll();
  }

  static async deleteGeneratedLink(id) {
    await GenLink.destroy({ where: { id } });
  }
}

module.exports = LinkRepository;