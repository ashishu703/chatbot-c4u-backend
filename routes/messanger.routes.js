const router = require("express").Router();
const validateUser = require("../middlewares/user.middleware.js");
const validateAgent = require("../middlewares/agent.middleware.js");
const AuthController = require("../controllers/MessangerAuthController.js");
const MessengerWebhookController = require("../controllers/MessengerWebhookController.js");
const MessengerChatController = require("../controllers/MessengerChatController.js");
const FacebookPageController = require("../controllers/FacebookPageController.js");
const authController = new AuthController();
const messengerWebhookController = new MessengerWebhookController();
const messengerChatController = new MessengerChatController();
const facebookPageController = new FacebookPageController();



router.post(
  "/auth-init",
  validateUser,
  authController.initiateUserAuth.bind(authController)
);

router.get(
  "/webhook",
  messengerWebhookController.verifyWebhook.bind(messengerWebhookController)
);

router.post(
  "/webhook",
  messengerWebhookController.handleWebhook.bind(messengerWebhookController)
);

router.post(
  "/send",
  validateUser,
  messengerChatController.send.bind(messengerChatController)
);

router.post(
  "/send-image",
  validateUser,
  messengerChatController.sendImage.bind(messengerChatController)
);

router.post(
  "/send-video",
  validateUser,
  messengerChatController.sendVideo.bind(messengerChatController)
);

router.post(
  "/send-doc",
  validateUser,
  messengerChatController.sendDoc.bind(messengerChatController)
);

router.post(
  "/send-audio",
  validateUser,
  messengerChatController.sendAudio.bind(messengerChatController)
);

router.post(
  "/send-agent-message",
  validateAgent,
  messengerChatController.send.bind(messengerChatController)
);

router.post(
  "/send-agent-image",
  validateAgent,
  messengerChatController.sendImage.bind(messengerChatController)
);

router.post(
  "/send-agent-video",
  validateAgent,
  messengerChatController.sendVideo.bind(messengerChatController)
);

router.post(
  "/send-agent-doc",
  validateAgent,
  messengerChatController.sendDoc.bind(messengerChatController)
);

router.post(
  "/send-agent-audio",
  validateAgent,
  messengerChatController.sendAudio.bind(messengerChatController)
);

router.get(
  "/accounts",
  validateUser,
  authController.getAccounts.bind(authController)
);

router.get(
  "/pages",
  validateUser,
  facebookPageController.getPages.bind(facebookPageController)
);


router.post(
  "/pages",
  validateUser,
  facebookPageController.activatePages.bind(facebookPageController)
);

router.post(
  "/discard-inactive-pages",
  validateUser,
  facebookPageController.discardInactivePages.bind(facebookPageController)
);

router.delete(
  "/accounts/:id",
  validateUser,
  authController.deleteAccount.bind(authController)
);

router.delete(
  "/pages/:id",
  validateUser,
  facebookPageController.deletePage.bind(facebookPageController)
);

module.exports = router;
