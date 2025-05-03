const { Partner } = require("../models");

class BrandRepository {
  static async addBrand(filename) {
    await Partner.create({ filename });
  }

  static async getBrands() {
    return await Partner.findAll();
  }

  static async deleteBrand(id) {
    await Partner.destroy({ where: { id } });
  }
}

module.exports = BrandRepository;