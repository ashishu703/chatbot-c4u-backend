const express = require("express");
const router = express.Router();
const InboxController = require("../controllers/inboxController");
const validateUser = require("../middlewares/user");
const { checkPlan } = require("../middlewares/plan");

router.post("/webhook/:uid", InboxController.handleWebhook);
router.get("/get_chats", validateUser, InboxController.getChats);
router.post("/get_convo", validateUser, InboxController.getConversation);
router.get("/webhook/:uid", InboxController.verifyWebhook);
router.get("/", InboxController.testSocket);
router.post("/send_templet", validateUser, checkPlan, InboxController.sendTemplate);
router.post("/send_image", validateUser, checkPlan, InboxController.sendImage);
router.post("/send_video", validateUser, checkPlan, InboxController.sendVideo);
router.post("/send_doc", validateUser, checkPlan, InboxController.sendDocument);
router.post("/send_audio", validateUser, checkPlan, InboxController.sendAudio);
router.post("/send_text", validateUser, checkPlan, InboxController.sendText);
router.post("/send_meta_templet", validateUser, checkPlan, InboxController.sendMetaTemplate);
router.post("/del_chat", validateUser, InboxController.deleteChat);

module.exports = router;