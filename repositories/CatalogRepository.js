const { Catalog } = require("../models");
const Repository = require("./Repository");

class CatalogRepository extends Repository {
  constructor() {
    super(Catalog);
  }

  async getCatalogsByUid(uid) {
    try {
      const catalogs = await this.find({
        where: { uid },
        order: [["createdAt", "DESC"]],
      });
      
      if (catalogs && catalogs.length > 0) {
        return catalogs.map(catalog => ({
          ...catalog,
          catalog_id: catalog.catalog_id?.trim() || catalog.catalog_id
        }));
      }
      
      return [];
    } catch (error) {
      console.error("❌ Error in getCatalogsByUid:", error.message);
      throw error;
    }
  }

  async getCatalogById(id, uid) {
    const catalog = await this.findFirst({
      where: { id, uid },
      include: [{ model: require("../models").Product, as: "products" }],
    });
    
    if (catalog && catalog.catalog_id) {
      catalog.catalog_id = catalog.catalog_id.trim();
    }
    
    return catalog;
  }

  async findFirst(condition = {}, relations = []) {
    try {
      const record = await this.model.findOne({
        ...condition,
        include: relations
      });
      
      if (!record) return null;
      
      const catalog = record.toJSON();
      if (catalog.catalog_id) {
        catalog.catalog_id = catalog.catalog_id.trim();
      }
      
      return catalog;
    } catch (error) {
      console.error("❌ Error in findFirst:", error.message);
      throw error;
    }
  }

  async createCatalog(data) {
    try {
      return await this.create(data);
    } catch (error) {
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error("Catalog with this ID already exists");
      }
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join(', ');
        throw new Error(`Validation error: ${messages}`);
      }
      throw error;
    }
  }

  async updateCatalog(id, uid, data) {
    return this.update(data, { id, uid });
  }

  async deleteCatalog(id, uid) {
    return this.delete({ id, uid });
  }
}

module.exports = CatalogRepository;
