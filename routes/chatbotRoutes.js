const express = require("express");
const router = express.Router();
const ChatbotController = require("../controllers/chatbotController");
const validateUser = require("../middlewares/user");
const { checkPlan } = require("../middlewares/plan");

router.post("/add_chatbot", validateUser, checkPlan, ChatbotController.addChatbot);
router.post("/update_chatbot", validateUser, checkPlan, ChatbotController.updateChatbot);
router.get("/get_chatbot", validateUser, ChatbotController.getChatbots);
router.post("/change_bot_status", validateUser, checkPlan, ChatbotController.changeBotStatus);
router.post("/del_chatbot", validateUser, ChatbotController.deleteChatbot);
router.post("/make_request_api", validateUser, checkPlan, ChatbotController.makeRequestApi);

module.exports = router;