const express = require("express");
const router = express.Router();
const validateUser = require("../middlewares/user.middleware");
const validateAgent = require("../middlewares/agent.middleware");
const { checkPlan } = require("../middlewares/plan.middleware");
const AgentController = require("../controllers/AgentController");
const AgentChatController = require("../controllers/agentChatController");
const AgentMessageController = require("../controllers/agentMessageController");
const AgentTaskController = require("../controllers/agentTaskController");

const agentController = new AgentController();
const agentChatController = new AgentChatController();
const agentMessageController = new AgentMessageController();
const agentTaskController = new AgentTaskController();

router.post(
  "/add_agent",
  validateUser,
  checkPlan,
  agentController.addAgent.bind(agentController)
);
router.get(
  "/get_my_agents",
  validateUser,
  agentController.getMyAgents.bind(agentController)
);
router.post(
  "/change_agent_activeness",
  validateUser,
  agentController.changeAgentActiveness.bind(agentController)
);
router.post(
  "/del_agent",
  validateUser,
  agentController.deleteAgent.bind(agentController)
);



router.post("/login", agentController.login.bind(agentController));

router.get(
  "/get_me",
  validateAgent,
  agentController.getMe.bind(agentController)
);

router.get(
  "/get_my_assigned_chats",
  validateAgent,
  agentChatController.getMyAssignedChats.bind(agentChatController)
);
router.post(
  "/get_convo",
  validateAgent,
  agentChatController.getConversation.bind(agentChatController)
);

router.post(
  "/send_text",
  validateAgent,
  checkPlan,
  agentMessageController.sendText.bind(agentMessageController)
);
router.post(
  "/send_audio",
  validateAgent,
  checkPlan,
  agentMessageController.sendAudio.bind(agentMessageController)
);
router.post(
  "/return_media_url",
  validateAgent,
  agentMessageController.returnMediaUrl.bind(agentMessageController)
);
router.post(
  "/send_doc",
  validateAgent,
  checkPlan,
  agentMessageController.sendDocument.bind(agentMessageController)
);
router.post(
  "/send_video",
  validateAgent,
  checkPlan,
  agentMessageController.sendVideo.bind(agentMessageController)
);
router.post(
  "/send_image",
  validateAgent,
  checkPlan,
  agentMessageController.sendImage.bind(agentMessageController)
);

router.get(
  "/get_my_task",
  validateAgent,
  agentTaskController.getMyTasks.bind(agentTaskController)
);
router.post(
  "/mark_task_complete",
  validateAgent,
  agentTaskController.markTaskComplete.bind(agentTaskController)
);
router.post(
  "/change_chat_ticket_status",
  validateAgent,
  agentChatController.changeChatTicketStatus.bind(agentChatController)
);

module.exports = router;
