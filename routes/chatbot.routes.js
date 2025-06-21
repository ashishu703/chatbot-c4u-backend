const express = require("express");
const router = express.Router();
const ChatbotController = require("../controllers/ChatbotController");
const validateUser = require("../middlewares/user.middleware");
const { checkPlan } = require("../middlewares/plan.middleware");

const chatbotController = new ChatbotController();

router.post(
  "/add_chatbot",
  validateUser,
  checkPlan,
  chatbotController.addChatbot.bind(chatbotController)
);
router.post(
  "/update_chatbot",
  validateUser,
  checkPlan,
  chatbotController.updateChatbot.bind(chatbotController)
);
router.get(
  "/get_chatbot",
  validateUser,
  chatbotController.getChatbots.bind(chatbotController)
);
router.post(
  "/change_bot_status",
  validateUser,
  checkPlan,
  chatbotController.changeBotStatus.bind(chatbotController)
);
router.post(
  "/del_chatbot",
  validateUser,
  chatbotController.deleteChatbot.bind(chatbotController)
);
router.post(
  "/make_request_api",
  validateUser,
  checkPlan,
  chatbotController.makeRequestApi.bind(chatbotController)
);

module.exports = router;
