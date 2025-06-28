const ChatbotRepository = require("../repositories/ChatbotRepository");
const EdgeRepository = require("../repositories/FlowEdgeRepository");
const ChatRepository = require("../repositories/ChatRepository");
const AgentChatRepository = require("../repositories/AgentChatRepository");
const AgentRepository = require("../repositories/AgentRepository");
const { INCOMING } = require("../types/conversation-route.types");
const WhatsappMessageApi = require("../api/Whatsapp/WhatsappMessageApi");
const { ASSIGN_AGENT, DISABLE_CHAT_TILL, REQUEST_API } = require("../types/specified-messages.types");
const DisabledChatRepository = require("../repositories/DisabledChatRepository");
const { millisecondsToSeconds } = require("../utils/date.utils");

class ChatbotAutomationService {

  constructor(message) {
    this.message = message;
    this.chatRepository = new ChatRepository();
    this.chatbotRepository = new ChatbotRepository();
    this.edgeRepository = new EdgeRepository();
    this.agentRepository = new AgentRepository();
    this.agentChatRepository = new AgentChatRepository();
    this.disbaledChatRepository = new DisabledChatRepository();
  }

  async setChat(chatId) {
    const chat = await this.chatRepository.findWithAccount(chatId);
    this.chat = chat;
    this.account = chat.account;
  }


  async getBots() {
    const { chat_id, uid } = this.message;
    const assignedBots = await this.chatbotRepository.getAssignedBots(uid, chat_id);

    return assignedBots.length ?
      assignedBots :
      await this.chatbotRepository.getGeneralBots(uid);
  }

  async initBot() {
    try {
      const { route, chat_id: chatId } = this.message;

      await this.setChat(chatId);

      if (route == INCOMING) {
        let chatbots = await this.getBots();
        for (const chatbot of chatbots) {
          await this.executeChatbot(chatbot);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async initApi() {
    const { token, social_user_id: wabaId } = this.account;
    const whatsappApi = new WhatsappMessageApi(null, token, wabaId);
    await whatsappApi.initMeta();
    this.messageApi = whatsappApi;
  }


  async executeChatbot(chatbot) {

    const { flow_id: flowId } = chatbot;
    const { text } = this.message.body;

    let edge =
      await this.edgeRepository.findEdgeWithTargetNode(flowId, text) ??
      await this.edgeRepository.findFirstEdgeWithTargetNode(flowId);
    if (edge) {
      if (text === ASSIGN_AGENT) {
        this.assignAgentWithEdge(edge);
      } else if (text === DISABLE_CHAT_TILL) {
        this.disableChatWithEdge(edge);
      } else if (text === REQUEST_API) {
        
      } else {
        await this.respondWithEdge(edge);
      }
    }

    else
      console.log(`No edge found for message: ${text} `);
  }


  async respondWithEdge(edge) {
    const { targetNode } = edge;
    const { sender_id: senderId } = this.chat;
    if (targetNode) {
      const { msgContent } = targetNode.data;
      await this.initApi();
      await this.messageApi.send({
        ...msgContent,
        to: senderId
      });
    }
    else
      console.log(`No target node found for message: ${text} `);
  }

  async assignAgentWithEdge(edge) {
    const { targetNode, uid: ownerId } = edge;
    const { chat_id: chatId } = this.message;

    if (targetNode) {
      const { agentEmail } = targetNode.data.msgContent;
      const agent = await this.agentRepository.getAgentByEmail(ownerId, agentEmail);
      if (agent) {
        const { uid } = agent;
        await this.agentChatRepository.updateOrCreate({ uid: uid, owner_uid: ownerId, chat_id: chatId }, { owner_uid: ownerId, chat_id: chatId });
        console.log(`Agent assigned: ${agentEmail}`);
      }
      else console.log(`Agent not found: ${agentEmail}`);
    }
    else console.log(`No target node found for message: ${text} `);
  }

  async disableChatWithEdge(edge) {

    const { targetNode } = edge;
    const { chat_id: chatId } = this.message;

    if (targetNode) {
      const { timezone, timestamp } = targetNode.data.msgContent;
      this.disbaledChatRepository.updateOrCreate({
        chat_id: chatId,
        timezone,
        timestamp: millisecondsToSeconds(timestamp)
      }, { chat_id: chatId });
      console.log(`Chat disabled: ${chatId}`);
    }
    else console.log(`No target node found for message: ${text} `);
  }

};


module.exports = ChatbotAutomationService
