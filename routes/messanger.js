const router = require("express").Router();
const validateUser = require("../middlewares/user.js");

const AuthController = require("../controllers/Facebook/FacebookAuthController.js");
const MetaWebhookController = require("../controllers/Facebook/MetaWebhookController");
const MessengerChatController = require("../controllers/Facebook/MessengerChatController");
const authController = new AuthController();
const metaWebhookController = new MetaWebhookController();
const messengerChatController = new MessengerChatController();

router.post("/auth-init", validateUser, authController.initiateUserAuth.bind(authController));

router.get('/webhook', metaWebhookController.verifyWebhook.bind(metaWebhookController));

router.post('/webhook', metaWebhookController.handleWebhook.bind(metaWebhookController));

router.post('/send', validateUser, messengerChatController.send.bind(metaWebhookController));

module.exports = router;
