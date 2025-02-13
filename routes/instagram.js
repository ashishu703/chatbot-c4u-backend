const router = require("express").Router();
const validateUser = require("../middlewares/user.js");
const validateAgent = require("../middlewares/agent.js");

const AuthController = require("../controllers/instagram/InstagramAuthController.js");
const InstagramWebhookController = require("../controllers/instagram/InstagramWebhookController.js");
const InstagramChatController = require("../controllers/instagram/InstagramChatController.js");
const authController = new AuthController();
const instagramWebhookController = new InstagramWebhookController();
const instagramChatController = new InstagramChatController();

router.post("/auth-init", validateUser, authController.initiateUserAuth.bind(authController));

router.get('/webhook', instagramWebhookController.verifyWebhook.bind(instagramWebhookController));

router.get('/auth-uri', authController.getAuthUri.bind(authController));

router.post('/webhook', instagramWebhookController.handleWebhook.bind(instagramWebhookController));

router.post('/send', validateUser, instagramChatController.send.bind(instagramChatController));

router.post('/send-agent-message', validateAgent, instagramChatController.send.bind(instagramChatController));

router.get('/accounts', validateUser, authController.getAccounts.bind(authController));

router.delete('/accounts/:id', validateUser, authController.deleteAccount.bind(authController));

module.exports = router;
