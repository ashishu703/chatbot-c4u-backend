const { GenLink } = require("../models");

class LinkRepository {
  async getGeneratedLinks() {
    return await GenLink.findAll();
  }

  async deleteGeneratedLink(id) {
    await GenLink.destroy({ where: { id } });
  }
}

module.exports = LinkRepository;
