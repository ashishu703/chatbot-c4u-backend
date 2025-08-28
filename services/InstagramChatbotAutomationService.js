const ChatbotRepository = require("../repositories/ChatbotRepository");
const EdgeRepository = require("../repositories/FlowEdgeRepository");
const ChatRepository = require("../repositories/ChatRepository");
const AgentChatRepository = require("../repositories/AgentChatRepository");
const AgentRepository = require("../repositories/AgentRepository");
const DisabledChatRepository = require("../repositories/DisabledChatRepository");
const ChatDisabledException = require("../exceptions/CustomExceptions/ChatDisabledException");
const { INCOMING } = require("../types/conversation-route.types");
const { ASSIGN_AGENT, DISABLE_CHAT_TILL, REQUEST_API } = require("../types/specified-messages.types");
const { millisecondsToSeconds, hasDatePassedInTimezone, secondsToMilliseconds } = require("../utils/date.utils");
const { extractTextFromInstagramMessage } = require("../utils/messages.utils");

class InstagramChatbotAutomationService {

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

    if (assignedBots.length) {
      return assignedBots;
    } else {
      const generalBots = await this.chatbotRepository.getGeneralBots(uid);
      return generalBots;
    }
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
        console.error('Instagram Chatbot Init Error:', error);
    }
  }

  async executeChatbot(chatbot) {
    const { flow_id: flowId } = chatbot;
    const text = extractTextFromInstagramMessage(this.message);

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
          this.sendMessageWithEdge(targetNode, ownerId);
        }
      }
    }
  }

  async assignAgentWithEdge(targetNode, ownerId) {
    const { chat_id: chatId } = this.message;
    const { data } = targetNode;

    const agent = await this.agentRepository.findFirst({
      where: { uid: ownerId, active: 1 }
    });

    if (agent) {
      await this.agentChatRepository.createIfNotExists(
        { agent_id: agent.id, chat_id: chatId },
        { agent_id: agent.id, chat_id: chatId }
      );
    }
  }

  async disableChatWithEdge(targetNode) {
    const { chat_id: chatId } = this.message;
    const { data } = targetNode;
    const { timezone, timestamp } = data;

    await this.disbaledChatRepository.createIfNotExists(
      { chat_id: chatId, timezone, timestamp },
      { chat_id: chatId }
    );
  }

  async requestApiWithEdge(targetNode, flowId, chatbot) {
    const { data } = targetNode;
    const { url, method, headers, body: requestBody } = data;

    try {
      const response = await fetch(url, {
        method: method || 'GET',
        headers: headers || {},
        body: requestBody ? JSON.stringify(requestBody) : undefined,
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);
    } catch (error) {
      console.error('API Request Error:', error);
    }
  }

    async sendMessageWithEdge(targetNode, ownerId) {
    const { chat_id: chatId } = this.message;
    const { data } = targetNode;

    if (data && data.message) {
      try {
        const chat = await this.chatRepository.findWithAccountAndDisablity(chatId);
        if (!chat || !chat.account) {
          console.error('Chat or account not found for chat ID:', chatId);
          return;
        }

        const { account } = chat;
        const accessToken = account.access_token || account.token || account.accessToken;
        const pageId = account.social_user_id || account.instagram_business_account_id || account.id;

        if (!accessToken || !pageId) {
          console.error('Missing access token or page ID for Instagram account');
          return;
        }

        await this.sendInstagramMessage(chatId, data.message, accessToken, pageId);
        
      } catch (error) {
        console.error('Error sending Instagram message:', error);
      }
    }
  }

  async sendInstagramMessage(chatId, messageText, accessToken, pageId) {
    try {
      let senderId = this.message.sender_id;
      
      if (!senderId) {
        try {
          const chat = await this.chatRepository.findWithAccountAndDisablity(chatId);
          if (chat && chat.sender_id) {
            senderId = chat.sender_id;
          } else {
            console.error('No sender_id found in chat data');
            return;
          }
        } catch (error) {
          console.error('Error getting chat data for sender ID:', error);
          return;
        }
      }
      
      if (!senderId) {
        console.error('Sender ID not found in message');
        return;
      }



      const url = `https://graph.facebook.com/v18.0/${pageId}/messages`;
      
      const messageData = {
        recipient: { id: senderId },
        messaging_type: "RESPONSE",
        message: { text: messageText }
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(messageData)
      });

      const responseData = await response.json();
      
      if (response.ok && responseData.message_id) {
        await this.saveSentMessage(chatId, messageText, responseData.message_id);
      } else {
        console.error('Failed to send Instagram message:', responseData.error?.message || 'Unknown error');
      }
      
    } catch (error) {
      console.error('Error calling Instagram API:', error);
    }
  }

  async saveSentMessage(chatId, messageText, messageId) {
    try {
      const messageData = {
        chat_id: chatId,
        message_id: messageId,
        type: 'text',
        body: { text: messageText },
        status: 'sent',
        route: 'OUTGOING',
        timestamp: Math.floor(Date.now() / 1000).toString()
      };

      // TODO: Implement message saving to database
      
    } catch (error) {
      console.error('Error saving sent message:', error);
    }
  }
}

module.exports = InstagramChatbotAutomationService;
