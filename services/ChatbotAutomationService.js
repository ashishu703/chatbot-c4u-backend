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
const fetch = require("node-fetch");
const WhatsappMessageDto = require("../dtos/Whatsapp/WhatsappMessageDto");

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
        this.requestApiWithEdge(edge);
      } else {
        await this.respondWithEdge(edge);
      }
    }

    else
      console.log(`No edge found for message: ${text} `);
  }


  async respondWithEdge(edge) {
    const { targetNode } = edge;
    if (targetNode) {
      const { msgContent } = targetNode.data;
      await this.send(msgContent);
    }
    else
      console.log(`No target node found for message:  `);
  }


  async send(payload) {
    await this.initApi();
    const { sender_id: senderId } = this.chat;
    return this.messageApi.send({
      ...payload,
      to: senderId
    });
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
    else console.log(`No target node found for message:  `);
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
    else console.log(`No target node found for message:  `);
  }

  async requestApiWithEdge(edge) {

    const { targetNode, flow_id: flowId } = edge;

    if (targetNode) {
      const { node_id: nodeId, data: nodeData } = targetNode;
      const { type, url, headers } = nodeData.msgContent;

      const requestHeader = headers.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
      }, {});;

      fetch(url, { method: type, headers: requestHeader }).then(async (response) => {
        const data = await response.json();
        const responseEdge = await this.edgeRepository.findEdgeUsingSourceWithTargetNode(flowId, nodeId);
        if (responseEdge && responseEdge.targetNode) {
          const { msgContent } = responseEdge.targetNode.data;

          const responseContent = (new WhatsappMessageDto(msgContent))
            .applyVariables(data)
            .getContent();

          await this.send(responseContent);

        }
        else console.log(`No target node found for message:  `);
      }).catch(error => {
        console.log("Chatbot API Failed: ", error);
      });

    }
    else console.log(`No target node found for message:  `);
  }

};


module.exports = ChatbotAutomationService
