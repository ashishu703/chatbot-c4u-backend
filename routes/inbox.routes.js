const express = require("express");
const router = express.Router();
const InboxController = require("../controllers/InboxController");
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

router.post(
  "/save_note",
  validateUser,
  inboxController.saveNote.bind(inboxController)
);

router.post(
  "/push_tag",
  validateUser,
  inboxController.pushTag.bind(inboxController)
);

router.post(
  "/del_tag",
  validateUser,
  inboxController.deleteTag.bind(inboxController)
);

router.post(
  "/update_agent_in_chat",
  validateUser,
  inboxController.updateAgentInChat.bind(inboxController)
);

router.post(
  "/get_agent_chats_owner",
  validateUser,
  inboxController.getAgentChatsOwner.bind(inboxController)
);
router.post(
  "/get_assigned_chat_agent",
  validateUser,
  inboxController.getAssignedChatAgent.bind(inboxController)
);

router.post(
  "/del_assign_chat_by_owner",
  validateUser,
  inboxController.deleteAssignedChat.bind(inboxController)
);



module.exports = router;
