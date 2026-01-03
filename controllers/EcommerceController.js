const EcommerceService = require("../services/EcommerceService");
const { formSuccess } = require("../utils/response.utils");

class EcommerceController {
  ecommerceService;

  constructor() {
    this.ecommerceService = new EcommerceService();
  }

  // Overview
  async getOverview(req, res, next) {
    try {
      const { uid } = req.user;
      const data = await this.ecommerceService.getOverview(uid);
      return formSuccess(res, { data });
    } catch (err) {
      next(err);
    }
  }

  // Catalogs
  async getCatalogs(req, res, next) {
    try {
      const { uid } = req.user;
      const catalogs = await this.ecommerceService.getCatalogs(uid);
      return formSuccess(res, { data: catalogs });
    } catch (err) {
      next(err);
    }
  }

  async createCatalog(req, res, next) {
    try {
      const { uid } = req.user;
      console.log("🔍 Creating catalog for uid:", uid);
      console.log("📝 Catalog data:", req.body);
      
      // Validate required fields
      if (!req.body.name || !req.body.catalog_id) {
        return res.status(400).json({
          success: false,
          message: "Catalog name and catalog_id are required",
        });
      }

      const catalog = await this.ecommerceService.createCatalog(uid, req.body);
      console.log("✅ Catalog created successfully:", catalog.id);
      return formSuccess(res, { data: catalog });
    } catch (err) {
      console.error("❌ Error creating catalog:", err.message);
      next(err);
    }
  }

  async updateCatalog(req, res, next) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const catalog = await this.ecommerceService.updateCatalog(uid, id, req.body);
      return formSuccess(res, { data: catalog });
    } catch (err) {
      next(err);
    }
  }

  async deleteCatalog(req, res, next) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      await this.ecommerceService.deleteCatalog(uid, id);
      return formSuccess(res, { message: "Catalog deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  // Products
  async getProducts(req, res, next) {
    try {
      const { uid } = req.user;
      const { catalogId } = req.query;
      const products = await this.ecommerceService.getProducts(uid, catalogId);
      return formSuccess(res, { data: products });
    } catch (err) {
      next(err);
    }
  }

  async syncProducts(req, res, next) {
    try {
      const { uid } = req.user;
      const { catalogId } = req.params;
      const { force } = req.query;
      const forceSync = force === "true" || force === true;
      const products = await this.ecommerceService.syncProducts(uid, catalogId, forceSync);
      return formSuccess(res, { data: products, message: "Products synced successfully" });
    } catch (err) {
      console.error("❌ Error syncing products:", err.message);
      next(err);
    }
  }

  async createProduct(req, res, next) {
    try {
      const { uid } = req.user;
      const { catalogId } = req.body;
      const product = await this.ecommerceService.createProduct(uid, catalogId, req.body);
      return formSuccess(res, { data: product });
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { uid } = req.user;
      const { id, catalogId } = req.params;
      const product = await this.ecommerceService.updateProduct(uid, catalogId, id, req.body);
      return formSuccess(res, { data: product });
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { uid } = req.user;
      const { id, catalogId } = req.params;
      await this.ecommerceService.deleteProduct(uid, catalogId, id);
      return formSuccess(res, { message: "Product deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  // Orders
  async getOrders(req, res, next) {
    try {
      const { uid } = req.user;
      const filters = {
        status: req.query.status,
        payment_status: req.query.payment_status,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };
      const data = await this.ecommerceService.getOrders(uid, filters);
      return formSuccess(res, { data });
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const order = await this.ecommerceService.getOrderById(uid, id);
      return formSuccess(res, { data: order });
    } catch (err) {
      next(err);
    }
  }

  async createOrder(req, res, next) {
    try {
      const { uid } = req.user;
      const order = await this.ecommerceService.createOrder(uid, req.body);
      return formSuccess(res, { data: order });
    } catch (err) {
      next(err);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const { status } = req.body;
      const order = await this.ecommerceService.updateOrderStatus(uid, id, status);
      return formSuccess(res, { data: order });
    } catch (err) {
      next(err);
    }
  }

  async updateOrder(req, res, next) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const order = await this.ecommerceService.updateOrder(uid, id, req.body);
      return formSuccess(res, { data: order });
    } catch (err) {
      next(err);
    }
  }

  // Payment Configurations
  async getPaymentConfigurations(req, res, next) {
    try {
      const { uid } = req.user;
      const configurations = await this.ecommerceService.getPaymentConfigurations(uid);
      return formSuccess(res, { data: configurations });
    } catch (err) {
      next(err);
    }
  }

  async createPaymentConfiguration(req, res, next) {
    try {
      const { uid } = req.user;
      const configuration = await this.ecommerceService.createPaymentConfiguration(uid, req.body);
      return formSuccess(res, { data: configuration });
    } catch (err) {
      next(err);
    }
  }

  async updatePaymentConfiguration(req, res, next) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      const configuration = await this.ecommerceService.updatePaymentConfiguration(uid, id, req.body);
      return formSuccess(res, { data: configuration });
    } catch (err) {
      next(err);
    }
  }

  async deletePaymentConfiguration(req, res, next) {
    try {
      const { uid } = req.user;
      const { id } = req.params;
      await this.ecommerceService.deletePaymentConfiguration(uid, id);
      return formSuccess(res, { message: "Payment configuration deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  // Commerce Settings
  async getCommerceSettings(req, res, next) {
    try {
      const { uid } = req.user;
      const settings = await this.ecommerceService.getCommerceSettings(uid);
      return formSuccess(res, { data: settings });
    } catch (err) {
      next(err);
    }
  }

  async updateCommerceSettings(req, res, next) {
    try {
      const { uid } = req.user;
      const settings = await this.ecommerceService.updateCommerceSettings(uid, req.body);
      return formSuccess(res, { data: settings });
    } catch (err) {
      next(err);
    }
  }

  // Order Settings
  async getOrderSettings(req, res, next) {
    try {
      const { uid } = req.user;
      const settings = await this.ecommerceService.getOrderSettings(uid);
      return formSuccess(res, { data: settings });
    } catch (err) {
      next(err);
    }
  }

  async updateOrderSettings(req, res, next) {
    try {
      const { uid } = req.user;
      const settings = await this.ecommerceService.updateOrderSettings(uid, req.body);
      return formSuccess(res, { data: settings });
    } catch (err) {
      next(err);
    }
  }

  async updateAccessToken(req, res, next) {
    try {
      const { uid } = req.user;
      const { platform, token } = req.body;

      if (!platform || !token) {
        return res.status(400).json({
          success: false,
          message: "Platform and token are required"
        });
      }

      if (platform !== "whatsapp" && platform !== "messenger") {
        return res.status(400).json({
          success: false,
          message: "Platform must be 'whatsapp' or 'messenger'"
        });
      }

      const updated = await this.ecommerceService.updateAccessToken(uid, platform, token);
      return formSuccess(res, { data: updated, message: "Access token updated successfully" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = EcommerceController;
