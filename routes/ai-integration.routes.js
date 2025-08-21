const express = require("express");
const AiIntegrationController = require("../controllers/AiIntegrationController");
const userMiddleware = require("../middlewares/user.middleware");

const router = express.Router();
const aiIntegrationController = new AiIntegrationController();

// Apply user middleware to all routes
router.use(userMiddleware);

// Simple AI Integration routes
router.post("/", aiIntegrationController.create.bind(aiIntegrationController));
router.get("/", aiIntegrationController.getAll.bind(aiIntegrationController));
router.get("/active", aiIntegrationController.getActive.bind(aiIntegrationController));
router.put("/:id", aiIntegrationController.update.bind(aiIntegrationController));
router.delete("/:id", aiIntegrationController.delete.bind(aiIntegrationController));

module.exports = router;
