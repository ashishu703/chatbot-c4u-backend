const express = require("express");
const router = express.Router();
const InboxController = require("../controllers/inboxController");
const validateUser = require("../middlewares/user");
const { checkPlan } = require("../middlewares/plan");

const inboxController = new InboxController();

router.post(
  "/webhook/:uid",
  inboxController.handleWebhook.bind(inboxController)
);
router.get(
  "/get_chats",
  validateUser,
  inboxController.getChats.bind(inboxController)
);
router.post(
  "/get_convo",
  validateUser,
  inboxController.getConversation.bind(inboxController)
);
router.get(
  "/webhook/:uid",
  inboxController.verifyWebhook.bind(inboxController)
);
router.get("/", inboxController.testSocket.bind(inboxController));
router.post(
  "/send_templet",
  validateUser,
  checkPlan,
  inboxController.sendTemplate.bind(inboxController)
);
router.post(
  "/send_image",
  validateUser,
  checkPlan,
  inboxController.sendImage.bind(inboxController)
);
router.post(
  "/send_video",
  validateUser,
  checkPlan,
  inboxController.sendVideo.bind(inboxController)
);
router.post(
  "/send_doc",
  validateUser,
  checkPlan,
  inboxController.sendDocument.bind(inboxController)
);
router.post(
  "/send_audio",
  validateUser,
  checkPlan,
  inboxController.sendAudio.bind(inboxController)
);
router.post(
  "/send_text",
  validateUser,
  checkPlan,
  inboxController.sendText.bind(inboxController)
);
router.post(
  "/send_meta_templet",
  validateUser,
  checkPlan,
  inboxController.sendMetaTemplate.bind(inboxController)
);
router.post(
  "/del_chat",
  validateUser,
  inboxController.deleteChat.bind(inboxController)
);

module.exports = router;
