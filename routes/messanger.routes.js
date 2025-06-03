const router = require("express").Router();
const validateUser = require("../middlewares/user.js");
const validateAgent = require("../middlewares/agent.js");
const AuthController = require("../controllers/_messanger/MessangerAuthController.js");
const MessengerWebhookController = require("../controllers/_messanger/MessengerWebhookController.js");
const MessengerChatController = require("../controllers/_messanger/MessengerChatController.js");
const FacebookPageController = require("../controllers/_messanger/FacebookPageController.js");
const authController = new AuthController();
const messengerWebhookController = new MessengerWebhookController();
const messengerChatController = new MessengerChatController();
const facebookPageController = new FacebookPageController();

router.get(
  "/auth-params",
  validateUser,
  authController.getAuthParams.bind(authController)
);

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
  "/inactive-pages",
  validateUser,
  facebookPageController.getInactivePages.bind(facebookPageController)
);

router.get(
  "/active-pages",
  validateUser,
  facebookPageController.getActivePages.bind(facebookPageController)
);

router.post(
  "/active-pages",
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
