const { Partner } = require("../models");
const Repository = require("./Repository");

class BrandRepository extends Repository {
  constructor() {
    super(Partner);
  }
  async addBrand(filename) {
    return this.create({ filename });
  }

  async getBrands() {
    return this.find();
  }

  async deleteBrand(id) {
    await this.delete({ id });
  }
}

module.exports = BrandRepository;
