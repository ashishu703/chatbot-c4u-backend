const { WebPrivate } = require("../models");
const Repository = require("./Repository");

class WebPrivateRepository extends Repository {
  constructor() {
    super(WebPrivate);
  }

  async updateWebPrivate(data) {
    return this.update(data, { id: 1 });
  }

  async getWebPrivate() {
    try {
      return await WebPrivate.findOne();
    } catch (error) {
      console.error("Error fetching WebPrivate:", error);
      throw error;
    }
  }
}

module.exports = WebPrivateRepository;
