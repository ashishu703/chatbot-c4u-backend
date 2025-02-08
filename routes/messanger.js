const router = require("express").Router();
const validateUser = require("../middlewares/user.js");

const AuthController = require("../controllers/Messanger/MessangerAuthController.js");
const MessengerWebhookController = require("../controllers/Messanger/MessengerWebhookController.js");
const MessengerChatController = require("../controllers/Messanger/MessengerChatController.js");
const authController = new AuthController();
const messengerWebhookController = new MessengerWebhookController();
const messengerChatController = new MessengerChatController();

router.post("/auth-init", validateUser, authController.initiateUserAuth.bind(authController));

router.get('/webhook', messengerWebhookController.verifyWebhook.bind(messengerWebhookController));

router.post('/webhook', messengerWebhookController.handleWebhook.bind(messengerWebhookController));

router.post('/send', validateUser, messengerChatController.send.bind(messengerChatController));

router.get('/accounts', validateUser, authController.getAccounts.bind(messengerChatController));

router.delete('/accounts/:id', validateUser, authController.deleteAccount.bind(messengerChatController));

module.exports = router;
