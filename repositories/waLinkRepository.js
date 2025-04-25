const GenLinks = require('../models/gen_links');

class WaLinkRepository {
  async create(linkData) {
    return await GenLinks.create(linkData);
  }
}

module.exports = new WaLinkRepository();