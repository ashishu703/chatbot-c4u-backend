const ChatbotRepository = require("../repositories/ChatbotRepository");
const EdgeRepository = require("../repositories/FlowEdgeRepository");
const ChatRepository = require("../repositories/ChatRepository");
const AgentChatRepository = require("../repositories/AgentChatRepository");
const AgentRepository = require("../repositories/AgentRepository");
const { INCOMING } = require("../types/conversation-route.types");
const WhatsappMessageApi = require("../api/Whatsapp/WhatsappMessageApi");
const { ASSIGN_AGENT, DISABLE_CHAT_TILL, REQUEST_API } = require("../types/specified-messages.types");
const DisabledChatRepository = require("../repositories/DisabledChatRepository");
const { millisecondsToSeconds, hasDatePassedInTimezone, secondsToMilliseconds } = require("../utils/date.utils");
const fetch = require("node-fetch");
const WhatsappMessageDto = require("../dtos/Whatsapp/WhatsappMessageDto");
const WhatsappChatService = require("./WhatsappChatService");
const { dataGet } = require("../utils/others.utils");
const { whatsappMessageDtoToSaveableBody, extractTextFromWhatsappMessage } = require("../utils/messages.utils");
const ChatDisabledException = require("../exceptions/CustomExceptions/ChatDisabledException");

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
    const chat = await this.chatRepository.findWithAccountAndDisablity(chatId);
    this.chat = chat;
    this.account = chat.account;
    const disablity = chat.disablity;
    this.checkIfChatIsDisabled(disablity);
  }

  checkIfChatIsDisabled(disablity) {
    if (disablity) {
      const { timezone, timestamp } = disablity;
      if (!hasDatePassedInTimezone(timezone, secondsToMilliseconds(timestamp)))
        throw new ChatDisabledException();
    }
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
      if (error instanceof ChatDisabledException)
        console.log("Chat Disabled");
      else
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
    const text = extractTextFromWhatsappMessage(this.message);

    let edge =
      await this.edgeRepository.findEdgeWithTargetNode(flowId, text) ??
      await this.edgeRepository.findFirstEdgeWithTargetNode(flowId);
    if (edge) {

      const { targetNode, uid: ownerId } = edge;
      if (targetNode) {
        if (text === ASSIGN_AGENT) {
          this.assignAgentWithEdge(targetNode, ownerId);
        } else if (text === DISABLE_CHAT_TILL) {
          this.disableChatWithEdge(targetNode);
        } else if (text === REQUEST_API) {
          this.requestApiWithEdge(targetNode, flowId, chatbot);
        } else {
          await this.respondWithEdge(targetNode, chatbot);
        }
      }
      else console.log(`No target node found for message:  `);
    }

    else
      console.log(`No edge found for message: ${text} `);
  }


  async respondWithEdge(targetNode, chatbot) {
    const { msgContent } = targetNode.data;
    const contentDto = new WhatsappMessageDto(msgContent);
    await this.send(contentDto, chatbot);
  }


  async send(contentDto, chatbot) {
    await this.initApi();
    const { sender_id: senderId } = this.chat;
    const { title: chatbotName } = chatbot;
    const response = await this.messageApi.send({
      ...contentDto.getContent(),
      to: senderId
    });

    const messageId = dataGet(response, "messages.0.id");

    const body = whatsappMessageDtoToSaveableBody(contentDto);

    return (new WhatsappChatService()).processOutgoingMessage(
      {
        id: messageId,
        body: {
          ...body,
          chatbot: chatbotName
        },
        type: contentDto.getType(),
        chat: this.chat
      }
    );
  }

  async assignAgentWithEdge(targetNode, ownerId) {
    const { chat_id: chatId } = this.message;

    const { agentEmail } = targetNode.data.msgContent;
    const agent = await this.agentRepository.getAgentByEmail(ownerId, agentEmail);
    if (agent) {
      const { uid } = agent;
      await this.agentChatRepository.updateOrCreate({ uid: uid, owner_uid: ownerId, chat_id: chatId }, { owner_uid: ownerId, chat_id: chatId });
      console.log(`Agent assigned: ${agentEmail}`);
    }
    else console.log(`Agent not found: ${agentEmail}`);
  }

  async disableChatWithEdge(targetNode) {
    const { chat_id: chatId } = this.message;

    const { timezone, timestamp } = targetNode.data.msgContent;
    this.disbaledChatRepository.updateOrCreate({
      chat_id: chatId,
      timezone,
      timestamp: millisecondsToSeconds(timestamp)
    }, { chat_id: chatId });
    console.log(`Chat disabled: ${chatId}`);
  }

  async requestApiWithEdge(targetNode, flowId, chatbot) {


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
          .applyVariables(data);

        await this.send(responseContent, chatbot);

      }
      else console.log(`No target node found for message:  `);
    }).catch(error => {
      console.log("Chatbot API Failed: ", error);
    });

  }

};


module.exports = ChatbotAutomationService
