const CatalogRepository = require("../repositories/CatalogRepository");
const ProductRepository = require("../repositories/ProductRepository");
const EcommerceOrderRepository = require("../repositories/EcommerceOrderRepository");
const OrderItemRepository = require("../repositories/OrderItemRepository");
const PaymentConfigurationRepository = require("../repositories/PaymentConfigurationRepository");
const CommerceSettingsRepository = require("../repositories/CommerceSettingsRepository");
const OrderSettingsRepository = require("../repositories/OrderSettingsRepository");
const MetaCatalogService = require("./MetaCatalogService");
const MetaApiHelpers = require("../utils/meta-api.helpers");

class EcommerceService {
  catalogRepository;
  productRepository;
  orderRepository;
  orderItemRepository;
  paymentConfigRepository;
  commerceSettingsRepository;
  orderSettingsRepository;

  constructor() {
    this.catalogRepository = new CatalogRepository();
    this.productRepository = new ProductRepository();
    this.orderRepository = new EcommerceOrderRepository();
    this.orderItemRepository = new OrderItemRepository();
    this.paymentConfigRepository = new PaymentConfigurationRepository();
    this.commerceSettingsRepository = new CommerceSettingsRepository();
    this.orderSettingsRepository = new OrderSettingsRepository();
    this.metaCatalogService = new MetaCatalogService();
  }

  async getOverview(uid) {
    const catalogs = await this.catalogRepository.getCatalogsByUid(uid);
    return {
      connectedCatalogs: catalogs.length,
    };
  }

  async getCatalogs(uid) {
    const catalogs = await this.catalogRepository.getCatalogsByUid(uid);
    
    const uniqueCatalogs = [];
    const seenCatalogIds = new Set();
    
    for (const catalog of catalogs) {
      const catalogId = catalog.catalog_id?.trim();
      if (!catalogId) continue;
      
      if (!seenCatalogIds.has(catalogId)) {
        seenCatalogIds.add(catalogId);
        uniqueCatalogs.push(catalog);
      } else {
        try {
          await this.catalogRepository.deleteCatalog(catalog.id, uid);
        } catch (error) {
          // Silently handle duplicate deletion errors
        }
      }
    }
    
    return uniqueCatalogs;
  }

  async createCatalog(uid, data) {
    if (!data.name || !data.catalog_id) {
      throw new Error("Catalog name and catalog_id are required");
    }

    const catalogId = data.catalog_id.trim();
    
    const existing = await this.catalogRepository.findFirst({
      where: { catalog_id: catalogId, uid },
    });

    if (existing) {
      return existing;
    }

    const allUserCatalogs = await this.catalogRepository.getCatalogsByUid(uid);
    const duplicate = allUserCatalogs.find(c => c.catalog_id?.trim() === catalogId);
    if (duplicate) {
      return duplicate;
    }

    try {
      const newCatalog = await this.catalogRepository.createCatalog({
        uid,
        name: data.name.trim(),
        catalog_id: catalogId,
        platform: data.platform || "whatsapp",
        status: data.status || "active",
        meta_data: data.meta_data || {},
      });
      
      try {
        await this.syncProductsFromMeta(uid, newCatalog.id, catalogId, false);
      } catch (syncError) {
        console.error("⚠️ Failed to sync products from Meta:", syncError.message);
      }
      
      return newCatalog;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError' || error.message.includes('already exists')) {
        const existingCatalog = await this.catalogRepository.findFirst({
          where: { catalog_id: catalogId, uid },
        });
        if (existingCatalog) {
          return existingCatalog;
        }
      }
      throw error;
    }
  }

  async syncProductsFromMeta(uid, catalogDbId, metaCatalogId, forceSync = false) {
    return await this.metaCatalogService.syncProductsFromMeta(uid, catalogDbId, metaCatalogId, forceSync);
  }

  async updateCatalog(uid, id, data) {
    return this.catalogRepository.updateCatalog(id, uid, data);
  }

  async deleteCatalog(uid, id) {
    return this.catalogRepository.deleteCatalog(id, uid);
  }

  async getProducts(uid, catalogId = null) {
    if (catalogId) {
      const products = await this.productRepository.getProductsByCatalogId(catalogId);
      if (products.length === 0) {
        const catalog = await this.catalogRepository.findFirst({
          where: { id: catalogId, uid },
        });
        
        if (catalog && catalog.catalog_id) {
          try {
            await this.syncProductsFromMeta(uid, catalogId, catalog.catalog_id.trim(), false);
            return await this.productRepository.getProductsByCatalogId(catalogId);
          } catch (syncError) {
            console.error("⚠️ Auto-sync failed:", syncError.message);
            return [];
          }
        }
      }
      
      return products;
    }
    return this.productRepository.getProductsByUid(uid);
  }

  async syncProducts(uid, catalogId, forceSync = true) {
    const catalogDbId = parseInt(catalogId) || catalogId;
    const catalog = await this.catalogRepository.findFirst({
      where: { id: catalogDbId, uid },
    });

    if (!catalog || !catalog.catalog_id) {
      throw new Error("Catalog not found");
    }

    return await this.syncProductsFromMeta(uid, catalogDbId, catalog.catalog_id.trim(), forceSync);
  }

  async createProduct(uid, catalogId, data) {
    const catalog = await this.catalogRepository.findFirst({
      where: { id: catalogId, uid },
    });

    if (!catalog || !catalog.catalog_id) {
      throw new Error("Catalog not found");
    }

    const accessToken = await this.metaCatalogService.getAccessToken(uid);
    const metaCatalogId = catalog.catalog_id.trim();

    const metaProduct = await this.metaCatalogService.createProductInMeta(
      metaCatalogId,
      data,
      accessToken
    );

    const metaProductId = metaProduct.id || metaProduct.product_id || data.retailer_id;
    
    const product = await this.productRepository.createProduct({
      catalog_id: catalogId,
      product_id: metaProductId,
      retailer_id: data.retailer_id || metaProduct.retailer_id || metaProductId,
      name: data.name,
      description: data.description || "",
      price: data.price,
      currency: data.currency || "INR",
      image_url: data.image_url || "",
      availability: data.availability || "in stock",
      condition: data.condition || "new",
      brand: data.brand || "",
      category: data.category || "",
      inventory: data.inventory || data.quantity || 0,
      url: data.url || "",
      status: MetaApiHelpers.normalizeAvailability(data.availability || "in stock"),
      meta_data: metaProduct
    });

    return product;
  }

  async updateProduct(uid, catalogId, id, data) {
    const product = await this.productRepository.findFirst({
      where: { id, catalog_id: catalogId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const catalog = await this.catalogRepository.findFirst({
      where: { id: catalogId, uid },
    });

    if (!catalog || !catalog.catalog_id) {
      throw new Error("Catalog not found");
    }

    if (product.product_id) {
      const accessToken = await this.metaCatalogService.getAccessToken(uid);
      
      const updateData = { ...data };
      if (data.availability) {
        updateData.availability = data.availability;
      }
      if (data.status) {
        updateData.availability = data.status === "active" ? "in stock" : "out of stock";
      }

      await this.metaCatalogService.updateProductInMeta(
        product.product_id,
        updateData,
        accessToken
      );
    }

    const updatePayload = { ...data };
    if (data.availability) {
      updatePayload.status = MetaApiHelpers.normalizeAvailability(data.availability);
    }

    return this.productRepository.updateProduct(id, catalogId, updatePayload);
  }

  async deleteProduct(uid, catalogId, id) {
    const product = await this.productRepository.findFirst({
      where: { id, catalog_id: catalogId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.product_id) {
      const accessToken = await this.metaCatalogService.getAccessToken(uid);
      await this.metaCatalogService.deleteProductInMeta(product.product_id, accessToken);
    }

    return this.productRepository.deleteProduct(id, catalogId);
  }

  // Orders
  async getOrders(uid, filters = {}) {
    const result = await this.orderRepository.getOrdersByUid(uid, filters);
    return {
      orders: result.data || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 10,
    };
  }

  async getOrderById(uid, id) {
    return this.orderRepository.getOrderById(id, uid);
  }

  async createOrder(uid, orderData) {
    const { items, ...orderFields } = orderData;
    
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = `WA_ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const order = await this.orderRepository.createOrder({
      uid,
      order_id: orderId,
      total,
      ...orderFields,
    });

    if (items && items.length > 0) {
      const orderItems = items.map((item) => ({
        order_id: order.id,
        ...item,
      }));
      await this.orderItemRepository.createOrderItems(orderItems);
    }

    return this.orderRepository.getOrderById(order.id, uid);
  }

  async updateOrderStatus(uid, id, status) {
    return this.orderRepository.updateOrderStatus(id, uid, status);
  }

  async updateOrder(uid, id, data) {
    return this.orderRepository.updateOrder(id, uid, data);
  }

  async getPaymentConfigurations(uid) {
    return this.paymentConfigRepository.getConfigurationsByUid(uid);
  }

  async createPaymentConfiguration(uid, data) {
    return this.paymentConfigRepository.createConfiguration({
      uid,
      ...data,
    });
  }

  async updatePaymentConfiguration(uid, id, data) {
    return this.paymentConfigRepository.updateConfiguration(id, uid, data);
  }

  async deletePaymentConfiguration(uid, id) {
    return this.paymentConfigRepository.deleteConfiguration(id, uid);
  }

  async getCommerceSettings(uid) {
    let settings = await this.commerceSettingsRepository.getSettingsByUid(uid);
    if (!settings) {
      settings = await this.commerceSettingsRepository.createOrUpdateSettings(uid, {
        show_catalog: false,
        enable_cart: false,
      });
    }
    return {
      showCatalog: settings.show_catalog || false,
      enableCart: settings.enable_cart || false,
    };
  }

  async updateCommerceSettings(uid, data) {
    return this.commerceSettingsRepository.createOrUpdateSettings(uid, {
      show_catalog: data.showCatalog || false,
      enable_cart: data.enableCart || false,
      settings_data: data.settingsData || {},
    });
  }

  async getOrderSettings(uid) {
    let settings = await this.orderSettingsRepository.getSettingsByUid(uid);
    if (!settings) {
      settings = await this.orderSettingsRepository.createOrUpdateSettings(uid, {});
    }
    return {
      paymentMethods: settings.payment_methods || {},
      shipping: settings.shipping || {},
      checkout: settings.checkout || {},
      statusMessages: settings.status_messages || {},
    };
  }

  async updateOrderSettings(uid, data) {
    return this.orderSettingsRepository.createOrUpdateSettings(uid, {
      payment_methods: data.paymentMethods || {},
      shipping: data.shipping || {},
      checkout: data.checkout || {},
      status_messages: data.statusMessages || {},
    });
  }

  async updateAccessToken(uid, platform, token) {
    const SocialAccountRepository = require("../repositories/SocialAccountRepository");
    const socialAccountRepo = new SocialAccountRepository();
    return await socialAccountRepo.updateToken(uid, platform, token);
  }
}

module.exports = EcommerceService;
