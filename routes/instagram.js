const router = require("express").Router();
const validateUser = require("../middlewares/user.js");

const AuthController = require("../controllers/Instagram/InstagramAuthController");
const InstagramWebhookController = require("../controllers/Instagram/InstagramWebhookController");
const InstagramChatController = require("../controllers/Instagram/InstagramChatController.js");
const authController = new AuthController();
const instagramWebhookController = new InstagramWebhookController();
const instagramChatController = new InstagramChatController();

router.post("/auth-init", validateUser, authController.initiateUserAuth.bind(authController));

router.get('/webhook', instagramWebhookController.verifyWebhook.bind(instagramWebhookController));

router.post('/webhook', instagramWebhookController.handleWebhook.bind(instagramWebhookController));

router.post('/send', validateUser, instagramChatController.send.bind(instagramChatController));

module.exports = router;
