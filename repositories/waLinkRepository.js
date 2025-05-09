const {GenLinks} = require('../models');

class WaLinkRepository {
  async create(linkData) {
    return await GenLinks.create(linkData);
  }
}

module.exports = WaLinkRepository;