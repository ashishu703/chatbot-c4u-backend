const express = require("express");
const router = express.Router();
const InboxController = require("../controllers/inboxController");
const validateUser = require("../middlewares/user.middleware");

const inboxController = new InboxController();


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

router.post(
  "/del_chat",
  validateUser,
  inboxController.deleteChat.bind(inboxController)
);



module.exports = router;
