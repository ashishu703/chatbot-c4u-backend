const express = require("express");
const router = express.Router();
const validateUser = require("../middlewares/user");
const validateAgent = require("../middlewares/agent");
const { checkPlan } = require("../middlewares/plan");
const AgentController = require("../controllers/agentController");
const AgentChatController = require("../controllers/agentChatController");
const AgentMessageController = require("../controllers/agentMessageController");
const AgentTaskController = require("../controllers/agentTaskController");

router.post("/add_agent", validateUser, checkPlan, AgentController.addAgent);
router.get("/get_my_agents", validateUser, AgentController.getMyAgents);
router.post("/change_agent_activeness", validateUser, AgentController.changeAgentActiveness);
router.post("/del_agent", validateUser, AgentController.deleteAgent);

router.post("/get_agent_chats_owner", validateUser, AgentChatController.getAgentChatsOwner);
router.post("/get_assigned_chat_agent", validateUser, AgentChatController.getAssignedChatAgent);
router.post("/update_agent_in_chat", validateUser, AgentChatController.updateAgentInChat);
router.post("/del_assign_chat_by_owner", validateUser, AgentChatController.deleteAssignedChat);

router.post("/login", AgentController.login);
router.get("/get_me", validateAgent, AgentController.getMe);

router.get("/get_my_assigned_chats", validateAgent, AgentChatController.getMyAssignedChats);
router.post("/get_convo", validateAgent, AgentChatController.getConversation);

router.post("/send_text", validateAgent, checkPlan, AgentMessageController.sendText);
router.post("/send_audio", validateAgent, checkPlan, AgentMessageController.sendAudio);
router.post("/return_media_url", validateAgent, AgentMessageController.returnMediaUrl);
router.post("/send_doc", validateAgent, checkPlan, AgentMessageController.sendDocument);
router.post("/send_video", validateAgent, checkPlan, AgentMessageController.sendVideo);
router.post("/send_image", validateAgent, checkPlan, AgentMessageController.sendImage);

router.get("/get_my_task", validateAgent, AgentTaskController.getMyTasks);
router.post("/mark_task_complete", validateAgent, AgentTaskController.markTaskComplete);
router.post("/change_chat_ticket_status", validateAgent, AgentChatController.changeChatTicketStatus);

module.exports = router;