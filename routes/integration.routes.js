const express = require("express");
const IntegrationController = require("../controllers/IntegrationController");
const userMiddleware = require("../middlewares/user.middleware");

const router = express.Router();
const integrationController = new IntegrationController();

// Apply user middleware to all routes
router.use(userMiddleware);

// Integration routes
router.post("/connect", integrationController.connect.bind(integrationController));
router.post("/disconnect", integrationController.disconnect.bind(integrationController));
router.get("/", integrationController.getAll.bind(integrationController));
router.get("/:type", integrationController.getByType.bind(integrationController));
router.post("/status", integrationController.updateStatus.bind(integrationController));
router.delete("/", integrationController.delete.bind(integrationController));

module.exports = router;

