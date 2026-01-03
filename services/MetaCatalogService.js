const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const MetaApiHelpers = require("../utils/meta-api.helpers");

class MetaCatalogService {
  constructor() {
    this.graphVersion = "v19.0";
    this.requiredPermissions = [
      "catalog_management",
      "business_management",
      "whatsapp_business_management"
    ];
  }

  async getAccessToken(uid) {
    const socialAccountRepo = new SocialAccountRepository();
    
    const whatsappAccount = await socialAccountRepo.getWhatsappAccount(uid);
    if (whatsappAccount?.token) {
      console.log(`🔑 Using WhatsApp token (length: ${whatsappAccount.token.length}, first 20 chars: ${whatsappAccount.token.substring(0, 20)}...)`);
      return whatsappAccount.token.trim();
    }

    const messengerAccount = await socialAccountRepo.getMessangerAccount(uid);
    if (messengerAccount?.token) {
      console.log(`🔑 Using Messenger token (length: ${messengerAccount.token.length}, first 20 chars: ${messengerAccount.token.substring(0, 20)}...)`);
      return messengerAccount.token.trim();
    }

    throw new Error("No valid access token found for user");
  }

  async validateToken(accessToken) {
    try {
      const url = MetaApiHelpers.buildGraphApiUrl(this.graphVersion, "me", {
        access_token: accessToken,
        fields: "id,name"
      });
      
      await MetaApiHelpers.fetchGraphApi(url);
      return { valid: true };
    } catch (error) {
      console.error("❌ Token validation failed:", error.message);
      return { valid: false, error: error.message };
    }
  }

  async validateCatalogAccess(catalogId, accessToken) {
    try {
      const url = MetaApiHelpers.buildGraphApiUrl(this.graphVersion, catalogId, {
        access_token: accessToken,
        fields: "id,name"
      });
      
      await MetaApiHelpers.fetchGraphApi(url);
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message || "Catalog not accessible",
        code: error.code,
        subcode: error.subcode
      };
    }
  }

  async validatePermissions(accessToken) {
    try {
      const url = MetaApiHelpers.buildGraphApiUrl(this.graphVersion, "me/permissions", {
        access_token: accessToken
      });
      
      const data = await MetaApiHelpers.fetchGraphApi(url);
      const grantedPermissions = data.data
        .filter(p => p.status === "granted")
        .map(p => p.permission);

      const missingPermissions = this.requiredPermissions.filter(
        perm => !grantedPermissions.includes(perm)
      );

      if (missingPermissions.length > 0) {
        console.warn(`⚠️ Missing permissions: ${missingPermissions.join(", ")}`);
        return { valid: false, missing: missingPermissions };
      }

      return { valid: true, missing: [] };
    } catch (error) {
      console.error("❌ Error validating permissions:", error.message);
      return { valid: false, missing: this.requiredPermissions, error: error.message };
    }
  }

  async getCatalogProducts(catalogId, accessToken, limit = 100) {
    const sanitizedCatalogId = MetaApiHelpers.sanitizeCatalogId(catalogId);
    const fields = "id,retailer_id,name,description,price,currency,availability,condition,image_url,brand,category,inventory,url";
    
    const url = MetaApiHelpers.buildGraphApiUrl(
      this.graphVersion,
      `${sanitizedCatalogId}/products`,
      {
        access_token: accessToken,
        fields: fields,
        limit: limit
      }
    );

    try {
      const data = await MetaApiHelpers.fetchGraphApi(url);
      return {
        products: data.data || [],
        paging: data.paging || null,
        hasMore: !!data.paging?.next
      };
    } catch (error) {
      console.error(`❌ Failed to fetch products from catalog ${sanitizedCatalogId}:`, {
        code: error.code,
        subcode: error.subcode,
        message: error.message,
        fbtrace_id: error.fbtrace_id
      });
      
      if (error.code) {
        throw error;
      }
      throw {
        code: "UNKNOWN",
        message: error.message || "Failed to fetch products from Meta",
        status: 500
      };
    }
  }

  async getAllCatalogProducts(catalogId, accessToken) {
    const allProducts = [];
    let nextUrl = null;
    let pageCount = 0;
    const maxPages = 100;

    try {
      do {
        let responseData;

        if (nextUrl) {
          responseData = await MetaApiHelpers.fetchGraphApi(nextUrl);
        } else {
          const result = await this.getCatalogProducts(catalogId, accessToken);
          responseData = {
            data: result.products,
            paging: result.paging
          };
        }

        if (responseData.data && responseData.data.length > 0) {
          allProducts.push(...responseData.data);
        }

        nextUrl = responseData.paging?.next || null;
        pageCount++;

        if (pageCount >= maxPages) {
          console.warn(`⚠️ Reached max pages limit (${maxPages}), stopping pagination`);
          break;
        }
      } while (nextUrl);

      return allProducts;
    } catch (error) {
      console.error(`❌ Error during pagination (page ${pageCount}):`, error);
      throw error;
    }
  }

  async syncProductsFromMeta(uid, catalogDbId, metaCatalogId, forceSync = false) {
    try {
      const accessToken = await this.getAccessToken(uid);
      const sanitizedCatalogId = MetaApiHelpers.sanitizeCatalogId(metaCatalogId);

      const tokenValidation = await this.validateToken(accessToken);
      if (!tokenValidation.valid) {
        throw new Error(`Invalid or expired access token: ${tokenValidation.error}. Please update your token in the social_accounts table.`);
      }

      const catalogValidation = await this.validateCatalogAccess(sanitizedCatalogId, accessToken);
      if (!catalogValidation.valid) {
        const errorMsg = catalogValidation.code === 100 && catalogValidation.subcode === 33
          ? `Catalog ${sanitizedCatalogId} not accessible. The token in your database may be expired or doesn't have permission. Please update the token in social_accounts table with your fresh token.`
          : `Cannot access catalog: ${catalogValidation.error}`;
        throw new Error(errorMsg);
      }

      const permissionCheck = await this.validatePermissions(accessToken);
      if (!permissionCheck.valid) {
        console.warn(`⚠️ Missing permissions: ${permissionCheck.missing.join(", ")}. Continuing anyway...`);
      }

      const ProductRepository = require("../repositories/ProductRepository");
      const productRepository = new ProductRepository();

      if (!forceSync) {
        const existingProducts = await productRepository.getProductsByCatalogId(catalogDbId);
        if (existingProducts && existingProducts.length > 0) {
          return existingProducts;
        }
      }

      const metaProducts = await this.getAllCatalogProducts(sanitizedCatalogId, accessToken);

      if (metaProducts.length === 0) {
        return [];
      }

      const savedProducts = [];
      for (const metaProduct of metaProducts) {
        try {
          const existingProduct = await productRepository.findFirst({
            where: {
              catalog_id: catalogDbId,
              product_id: metaProduct.id
            }
          });

          const productData = {
            name: metaProduct.name || "",
            description: metaProduct.description || "",
            price: MetaApiHelpers.parsePrice(metaProduct.price),
            currency: metaProduct.currency || "INR",
            image_url: metaProduct.image_url || "",
            retailer_id: metaProduct.retailer_id || metaProduct.id,
            availability: metaProduct.availability || "in stock",
            condition: metaProduct.condition || "new",
            brand: metaProduct.brand || "",
            category: metaProduct.category || "",
            inventory: metaProduct.inventory || 0,
            url: metaProduct.url || "",
            status: MetaApiHelpers.normalizeAvailability(metaProduct.availability),
            meta_data: metaProduct
          };

          if (existingProduct) {
            const updated = await productRepository.updateProduct(
              existingProduct.id,
              catalogDbId,
              productData
            );
            savedProducts.push(updated);
          } else {
            const product = await productRepository.createProduct({
              catalog_id: catalogDbId,
              product_id: metaProduct.id,
              ...productData
            });
            savedProducts.push(product);
          }
        } catch (productError) {
          console.error(`❌ Error saving product ${metaProduct.id}:`, productError.message);
        }
      }

      return savedProducts;
    } catch (error) {
      const errorInfo = {
        code: error.code || "UNKNOWN",
        subcode: error.subcode,
        message: error.message,
        fbtrace_id: error.fbtrace_id,
        type: error.type
      };

      console.error("❌ Error syncing products from Meta:", JSON.stringify(errorInfo, null, 2));

      if (error.code === 100 && error.subcode === 33) {
        throw new Error(`Catalog ${metaCatalogId} not accessible. The access token in your database may be expired or doesn't have permission to access this catalog. Please update your token in the social_accounts table with the fresh token you generated.`);
      }

      if (error.code === 190) {
        throw new Error("Invalid or expired access token. Please update the token in your database or reconnect your account.");
      }

      throw new Error(`Failed to sync products: ${error.message || "Unknown error"}`);
    }
  }

  async createProductInMeta(catalogId, productData, accessToken) {
    const sanitizedCatalogId = MetaApiHelpers.sanitizeCatalogId(catalogId);
    const url = MetaApiHelpers.buildGraphApiUrl(
      this.graphVersion,
      `${sanitizedCatalogId}/products`,
      { access_token: accessToken }
    );

    const metaProductPayload = {
      retailer_id: productData.retailer_id || productData.product_id,
      name: productData.name,
      description: productData.description || "",
      price: productData.price,
      currency: productData.currency || "INR",
      availability: productData.availability || "in stock",
      condition: productData.condition || "new",
      image_url: productData.image_url || "",
      url: productData.url || "",
      brand: productData.brand || "",
      category: productData.category || "",
      inventory: productData.inventory || productData.quantity || 0
    };

    try {
      const data = await MetaApiHelpers.fetchGraphApi(url, {
        method: 'POST',
        useFormData: true,
        body: metaProductPayload
      });
      return data;
    } catch (error) {
      console.error(`❌ Failed to create product in Meta catalog ${sanitizedCatalogId}:`, {
        code: error.code,
        subcode: error.subcode,
        message: error.message,
        fbtrace_id: error.fbtrace_id
      });
      throw error;
    }
  }

  async updateProductInMeta(metaProductId, productData, accessToken) {
    const url = MetaApiHelpers.buildGraphApiUrl(
      this.graphVersion,
      metaProductId,
      { access_token: accessToken }
    );

    const updatePayload = {};
    if (productData.name !== undefined) updatePayload.name = productData.name;
    if (productData.description !== undefined) updatePayload.description = productData.description;
    if (productData.price !== undefined) updatePayload.price = productData.price;
    if (productData.currency !== undefined) updatePayload.currency = productData.currency;
    if (productData.availability !== undefined) updatePayload.availability = productData.availability;
    if (productData.condition !== undefined) updatePayload.condition = productData.condition;
    if (productData.image_url !== undefined) updatePayload.image_url = productData.image_url;
    if (productData.url !== undefined) updatePayload.url = productData.url;
    if (productData.brand !== undefined) updatePayload.brand = productData.brand;
    if (productData.category !== undefined) updatePayload.category = productData.category;
    if (productData.inventory !== undefined || productData.quantity !== undefined) {
      updatePayload.inventory = productData.inventory || productData.quantity;
    }

    try {
      const data = await MetaApiHelpers.fetchGraphApi(url, {
        method: 'POST',
        useFormData: true,
        body: updatePayload
      });
      return data;
    } catch (error) {
      console.error(`❌ Failed to update product ${metaProductId} in Meta:`, {
        code: error.code,
        subcode: error.subcode,
        message: error.message,
        fbtrace_id: error.fbtrace_id
      });
      throw error;
    }
  }

  async deleteProductInMeta(metaProductId, accessToken) {
    const url = MetaApiHelpers.buildGraphApiUrl(
      this.graphVersion,
      metaProductId,
      { access_token: accessToken }
    );

    try {
      const data = await MetaApiHelpers.fetchGraphApi(url, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error(`❌ Failed to delete product ${metaProductId} from Meta:`, {
        code: error.code,
        subcode: error.subcode,
        message: error.message,
        fbtrace_id: error.fbtrace_id
      });
      throw error;
    }
  }
}

module.exports = MetaCatalogService;
