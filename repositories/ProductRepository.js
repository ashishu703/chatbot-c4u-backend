const { Product } = require("../models");
const Repository = require("./Repository");

class ProductRepository extends Repository {
  constructor() {
    super(Product);
  }

  async getProductsByCatalogId(catalogId) {
    return this.find({
      where: { catalog_id: catalogId },
      order: [["createdAt", "DESC"]],
    });
  }

  async getProductsByUid(uid) {
    const { Catalog } = require("../models");
    return this.find({
      include: [
        {
          model: Catalog,
          as: "catalog",
          where: { uid },
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async createProduct(data) {
    return this.create(data);
  }

  async updateProduct(id, catalogId, data) {
    return this.update(data, { id, catalog_id: catalogId });
  }

  async deleteProduct(id, catalogId) {
    return this.delete({ id, catalog_id: catalogId });
  }
}

module.exports = ProductRepository;
