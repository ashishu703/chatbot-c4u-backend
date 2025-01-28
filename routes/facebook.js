const router = require("express").Router();
const validateUser = require("../middlewares/user.js");

const AuthController = require("../controllers/Facebook/FacebookAuthController");
const MetaWebhookController = require("../controllers/Facebook/MetaWebhookController");
const authController = new AuthController();
const metaWebhookController = new MetaWebhookController();

router.post("/auth-init", validateUser, authController.initiateUserAuth.bind(authController));

router.get('/webhook', metaWebhookController.verifyWebhook.bind(metaWebhookController));
router.post('/webhook', metaWebhookController.handleWebhook.bind(metaWebhookController));

module.exports = router;
