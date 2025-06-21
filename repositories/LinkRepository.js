const { GenLink } = require("../models");
const Repository = require("./Repository");

class LinkRepository extends Repository {
  constructor() {
    super(GenLink);
  }
  async getGeneratedLinks() {
    return this.find();
  }

  async deleteGeneratedLink(id) {
    await this.delete({ id });
  }
}

module.exports = LinkRepository;
