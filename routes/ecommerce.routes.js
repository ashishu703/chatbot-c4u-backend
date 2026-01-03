const express = require("express");
const router = express.Router();
const validateUser = require("../middlewares/user.middleware");
const EcommerceController = require("../controllers/EcommerceController");

const ecommerceController = new EcommerceController();

// Overview
router.get("/overview", validateUser, ecommerceController.getOverview.bind(ecommerceController));

// Catalogs
router.get("/catalogs", validateUser, ecommerceController.getCatalogs.bind(ecommerceController));
router.post("/catalogs", validateUser, ecommerceController.createCatalog.bind(ecommerceController));
router.put("/catalogs/:id", validateUser, ecommerceController.updateCatalog.bind(ecommerceController));
router.delete("/catalogs/:id", validateUser, ecommerceController.deleteCatalog.bind(ecommerceController));

// Products
router.get("/products", validateUser, ecommerceController.getProducts.bind(ecommerceController));
router.post("/products", validateUser, ecommerceController.createProduct.bind(ecommerceController));
router.put("/products/:catalogId/:id", validateUser, ecommerceController.updateProduct.bind(ecommerceController));
router.delete("/products/:catalogId/:id", validateUser, ecommerceController.deleteProduct.bind(ecommerceController));
router.post("/catalogs/:catalogId/sync-products", validateUser, ecommerceController.syncProducts.bind(ecommerceController));

// Orders
router.get("/orders", validateUser, ecommerceController.getOrders.bind(ecommerceController));
router.get("/orders/:id", validateUser, ecommerceController.getOrderById.bind(ecommerceController));
router.post("/orders", validateUser, ecommerceController.createOrder.bind(ecommerceController));
router.put("/orders/:id/status", validateUser, ecommerceController.updateOrderStatus.bind(ecommerceController));
router.put("/orders/:id", validateUser, ecommerceController.updateOrder.bind(ecommerceController));

// Payment Configurations
router.get("/payments/configurations", validateUser, ecommerceController.getPaymentConfigurations.bind(ecommerceController));
router.post("/payments/configurations", validateUser, ecommerceController.createPaymentConfiguration.bind(ecommerceController));
router.put("/payments/configurations/:id", validateUser, ecommerceController.updatePaymentConfiguration.bind(ecommerceController));
router.delete("/payments/configurations/:id", validateUser, ecommerceController.deletePaymentConfiguration.bind(ecommerceController));

// Commerce Settings
router.get("/settings/commerce", validateUser, ecommerceController.getCommerceSettings.bind(ecommerceController));
router.put("/settings/commerce", validateUser, ecommerceController.updateCommerceSettings.bind(ecommerceController));

router.get("/settings/order", validateUser, ecommerceController.getOrderSettings.bind(ecommerceController));
router.put("/settings/order", validateUser, ecommerceController.updateOrderSettings.bind(ecommerceController));

router.put("/auth/token", validateUser, ecommerceController.updateAccessToken.bind(ecommerceController));

module.exports = router;
