const { Partner } = require("../models");

class BrandRepository {
   async addBrand(filename) {
    await Partner.create({ filename });
  }

   async getBrands() {
    return await Partner.findAll();
  }

   async deleteBrand(id) {
    await Partner.destroy({ where: { id } });
  }
}

module.exports = BrandRepository;