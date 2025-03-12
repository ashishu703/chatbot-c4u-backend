const router = require("express").Router();
const validateUser = require("../middlewares/user.js");
const validateAgent = require("../middlewares/agent.js");

const AuthController = require("../controllers/_instagram/InstagramAuthController.js");
const InstagramWebhookController = require("../controllers/_instagram/InstagramWebhookController.js");
const InstagramChatController = require("../controllers/_instagram/InstagramChatController.js");
const authController = new AuthController();
const instagramWebhookController = new InstagramWebhookController();
const instagramChatController = new InstagramChatController();

router.post("/auth-init", validateUser, authController.initiateUserAuth.bind(authController));

router.get('/webhook', instagramWebhookController.verifyWebhook.bind(instagramWebhookController));

router.get('/auth-uri', authController.getAuthUri.bind(authController));

router.post('/webhook', instagramWebhookController.handleWebhook.bind(instagramWebhookController));

router.post('/send', validateUser, instagramChatController.send.bind(instagramChatController));

router.post('/send-image', validateUser, instagramChatController.sendImage.bind(instagramChatController));

router.post('/send-video', validateUser, instagramChatController.sendVideo.bind(instagramChatController));

router.post('/send-doc', validateUser, instagramChatController.sendDoc.bind(instagramChatController));

router.post('/send-audio', validateUser, instagramChatController.sendAudio.bind(instagramChatController));

router.post('/send-agent-message', validateAgent, instagramChatController.send.bind(instagramChatController));

router.post('/send-agent-image', validateAgent, instagramChatController.sendImage.bind(instagramChatController));

router.post('/send-agent-video', validateAgent, instagramChatController.sendVideo.bind(instagramChatController));

router.post('/send-agent-doc', validateAgent, instagramChatController.sendDoc.bind(instagramChatController));

router.post('/send-agent-audio', validateAgent, instagramChatController.sendAudio.bind(instagramChatController));

router.get('/accounts', validateUser, authController.getAccounts.bind(authController));

router.delete('/accounts/:id', validateUser, authController.deleteAccount.bind(authController));

module.exports = router;
