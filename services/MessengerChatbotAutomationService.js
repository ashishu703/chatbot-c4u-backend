const ChatbotRepository = require("../repositories/ChatbotRepository");
const EdgeRepository = require("../repositories/FlowEdgeRepository");
const ChatRepository = require("../repositories/ChatRepository");
const AgentChatRepository = require("../repositories/AgentChatRepository");
const AgentRepository = require("../repositories/AgentRepository");
const MessengerMessageApi = require("../api/Messanger/MessengerMessageApi");
const DisabledChatRepository = require("../repositories/DisabledChatRepository");
const MessangerChatService = require("./MessangerChatService");
const MessageRepository = require("../repositories/MessageRepository");
const ChatDisabledException = require("../exceptions/CustomExceptions/ChatDisabledException");
const fetch = require("node-fetch");
const { INCOMING, OUTGOING } = require("../types/conversation-route.types");
const { ASSIGN_AGENT, DISABLE_CHAT_TILL, REQUEST_API } = require("../types/specified-messages.types");
const { millisecondsToSeconds, hasDatePassedInTimezone, secondsToMilliseconds } = require("../utils/date.utils");
const { dataGet } = require("../utils/others.utils");
const { extractTextFromMessengerMessage, messengerMessageDtoToSaveableBody } = require("../utils/messages.utils");
const { getCurrentTimeStampInSeconds } = require("../utils/date.utils");
const ChatIOService = require("./ChatIOService");
const MessengerMessageDto = require("../dtos/Messenger/MessengerMessageDto");
const MessengerMessageHandlerFactory = require("./messenger/MessengerMessageHandlerFactory");

class MessengerChatbotAutomationService {

  constructor(message) {
    this.message = message;
    this.chatRepository = new ChatRepository();
    this.chatbotRepository = new ChatbotRepository();
    this.edgeRepository = new EdgeRepository();
    this.agentRepository = new AgentRepository();
    this.agentChatRepository = new AgentChatRepository();
    this.disbaledChatRepository = new DisabledChatRepository();
    this.messageRepository = new MessageRepository();
    this.ioService = new ChatIOService();
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
    
    console.log('Debug: getBots - message object:', {
      chat_id: chat_id,
      uid: uid,
      hasChatId: !!chat_id,
      hasUid: !!uid
    });
    
    // If chat_id is undefined, only get general bots
    if (!chat_id) {
      console.log('Debug: chat_id is undefined, getting general bots only');
      return await this.chatbotRepository.getGeneralBots(uid);
    }
    
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
        await Promise.all(chatbots.map(chatbot => this.executeChatbot(chatbot)));
      }
    } catch (error) {
      if (error instanceof ChatDisabledException)
        console.log("Chat Disabled");
      else
        console.error(error);
    }
  }

  async initApi() {
    // For Messenger, we need to get the page token from the chat's page
    const { page } = this.chat;
    console.log('Debug: Chat object:', {
      chatId: this.chat.id,
      hasPage: !!page,
      pageId: page?.id,
      hasToken: !!page?.token
    });
    
    if (page && page.token) {
      this.messengerApi = new MessengerMessageApi(null, page.token);
      await this.messengerApi.initMeta();
    } else {
      console.error('Debug: Page or token missing:', {
        page: page,
        token: page?.token
      });
      throw new Error("No page token available for Messenger API");
    }
  }

  async executeChatbot(chatbot) {
    const { flow_id: flowId } = chatbot;
    const text = extractTextFromMessengerMessage(this.message);
    
    console.log('Debug: Executing chatbot:', {
      chatbotId: chatbot.id,
      chatbotTitle: chatbot.title,
      flowId: flowId,
      messageText: text
    });

    // Add debug logging for message structure
    console.log('Debug: Message structure:', {
      type: this.message.type,
      body: this.message.body,
      hasQuickReply: !!(this.message.body && this.message.body.interactive)
    });

    // Add detailed debug for interactive messages
    if (this.message.type === 'interactive') {
      console.log('Debug: Interactive message details:', {
        bodyText: this.message.body.text,
        interactiveType: this.message.body.interactive?.type,
        buttonReply: this.message.body.interactive?.button_reply,
        directButtonReply: this.message.body.button_reply
      });
    }

    let edge =
      await this.edgeRepository.findEdgeWithTargetNode(flowId, text) ??
      await this.edgeRepository.findFirstEdgeWithTargetNode(flowId);
    
    console.log('Debug: Edge found:', {
      hasEdge: !!edge,
      edgeId: edge?.edge_id,
      sourceHandle: edge?.source_handle,
      source: edge?.source,
      target: edge?.target
    });
    
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
    console.log('Debug: targetNode.data structure:', JSON.stringify(targetNode.data, null, 2));
    
    const nodeType = targetNode.data.type;
    
    // Use factory pattern to create appropriate message handler
    const messageHandler = MessengerMessageHandlerFactory.createHandler(nodeType, this);
    
    // Handle the message using the appropriate handler
    await messageHandler.handleMessage(targetNode.data, chatbot);
  }

  // Add methods needed by condition handler
  getMessageHandlerFactory() {
    return MessengerMessageHandlerFactory;
  }

  getChat() {
    return this.chat;
  }

  getMessengerApi() {
    return this.messengerApi;
  }

  async processOutgoingMessage({
    id,
    body,
    type,
    chat,
  }) {
    const chatId = chat.id;
    const timestamp = getCurrentTimeStampInSeconds();
    await this.ioService.setChat(chat).init();
    const message = await this.messageRepository.create(
      {
        timestamp,
        message_id: id,
        body,
        type,
        status: "sent",
        uid: chat.uid,
        chat_id: chatId,
        route: OUTGOING,
      });

    this.ioService.emitNewMsgEvent(message);
    await this.chatRepository.updateLastMessage(
      chatId,
      message.id,
      timestamp
    );
    await this.ioService.emitUpdateConversationEvent(chat);
    return message;
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
    }, {});

    fetch(url, { method: type, headers: requestHeader }).then(async (response) => {
      const data = await response.json();
      const responseEdge = await this.edgeRepository.findEdgeUsingSourceWithTargetNode(flowId, nodeId);
      if (responseEdge && responseEdge.targetNode) {
        await this.sendTextMessage(responseEdge.targetNode.data, chatbot);
      }
      else console.log(`No target node found for message:  `);
    }).catch(error => {
      console.log("Chatbot API Failed: ", error);
    });
  }
}

module.exports = MessengerChatbotAutomationService; 