const { GenLink } = require("../models");

class LinkRepository {
  static async getGeneratedLinks() {
    return await GenLink.findAll();
  }

  static async deleteGeneratedLink(id) {
    await GenLink.destroy({ where: { id } });
  }
}

module.exports = LinkRepository;