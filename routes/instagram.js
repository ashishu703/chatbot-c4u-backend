const express = require("express");
const router = express.Router();

const validateUser = require("../middlewares/user.js");
const validateAgent = require("../middlewares/agent.js");

// Import controller classes
const InstagramAuthController = require("../controllers/_instagram/InstagramAuthController.js");
const InstagramWebhookController = require("../controllers/_instagram/InstagramWebhookController.js");
const InstagramChatController = require("../controllers/_instagram/InstagramChatController.js");

// Instantiate controllers
const authController = new InstagramAuthController();
const webhookController = new InstagramWebhookController();
const chatController = new InstagramChatController();

// -------- AUTH ROUTES --------
router.post(
  "/auth-init",
  validateUser,
  authController.initiateUserAuth.bind(authController)
);
router.get("/auth-uri", authController.getAuthUri.bind(authController));
router.get(
  "/accounts",
  validateUser,
  authController.getAccounts.bind(authController)
);
router.delete(
  "/accounts/:id",
  validateUser,
  authController.deleteAccount.bind(authController)
);

// -------- WEBHOOK ROUTES --------
router.get("/webhook", webhookController.verifyWebhook.bind(webhookController));
router.post(
  "/webhook",
  webhookController.handleWebhook.bind(webhookController)
);

// -------- USER CHAT ROUTES --------
router.post("/send", validateUser, chatController.send.bind(chatController));
router.post(
  "/send-image",
  validateUser,
  chatController.sendImage.bind(chatController)
);
router.post(
  "/send-video",
  validateUser,
  chatController.sendVideo.bind(chatController)
);
router.post(
  "/send-doc",
  validateUser,
  chatController.sendDoc.bind(chatController)
);
router.post(
  "/send-audio",
  validateUser,
  chatController.sendAudio.bind(chatController)
);

// -------- AGENT CHAT ROUTES --------
router.post(
  "/send-agent-message",
  validateAgent,
  chatController.send.bind(chatController)
);
router.post(
  "/send-agent-image",
  validateAgent,
  chatController.sendImage.bind(chatController)
);
router.post(
  "/send-agent-video",
  validateAgent,
  chatController.sendVideo.bind(chatController)
);
router.post(
  "/send-agent-doc",
  validateAgent,
  chatController.sendDoc.bind(chatController)
);
router.post(
  "/send-agent-audio",
  validateAgent,
  chatController.sendAudio.bind(chatController)
);

module.exports = router;
