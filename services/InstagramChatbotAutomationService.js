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

    console.log('🤖 [CHATBOT] Executing chatbot:', {
      flowId,
      extractedText: text,
      chatbotId: chatbot.id
    });

    let allEdges = await this.edgeRepository.findAllConnectedMessages(flowId, text);
    
    console.log('🔍 [CHATBOT] All edges found:', {
      edgesFound: allEdges.length,
      edges: allEdges.map(edge => ({
        edgeId: edge.id,
        targetNodeId: edge.targetNode?.node_id,
        targetNodeData: edge.targetNode?.data
      }))
    });
    
    if (allEdges && allEdges.length > 0) {
      for (let i = 0; i < allEdges.length; i++) {
        const edge = allEdges[i];
        const { targetNode, uid: ownerId } = edge;
        if (targetNode) {
          console.log('📝 [CHATBOT] Processing edge:', {
            edgeId: edge.id,
            nodeId: targetNode.node_id,
            message: targetNode.data?.message,
            nodeType: targetNode.data?.type,
            messageIndex: i + 1,
            totalMessages: allEdges.length
          });

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
      }
    } else {
      console.log('❌ [CHATBOT] No edges found for text:', text);
    }
  }

  async respondWithEdge(targetNode, chatbot) {
    console.log('📤 [CHATBOT] Responding with edge:', {
      targetNodeData: targetNode.data,
      nodeType: targetNode.data?.type
    });
    
    const nodeType = targetNode.data.type;
    
    switch (nodeType) {
      case 'simpleMessage':
        if (targetNode.data.message) {
          await this.sendMessageWithEdge(targetNode, chatbot);
        }
        break;
        
      case 'buttonMessage':
        await this.sendButtonMessage(targetNode, chatbot);
        break;
        
      case 'imageMessage':
        await this.sendImageMessage(targetNode, chatbot);
        break;
        
      case 'audioMessage':
        await this.sendAudioMessage(targetNode, chatbot);
        break;
        
      case 'videoMessage':
        await this.sendVideoMessage(targetNode, chatbot);
        break;
        
      case 'documentMessage':
        await this.sendDocumentMessage(targetNode, chatbot);
        break;
        
      case 'locationMessage':
        await this.sendLocationMessage(targetNode, chatbot);
        break;
        
      case 'contactMessage':
        await this.sendContactMessage(targetNode, chatbot);
        break;
        
      case 'listMessage':
        await this.sendListMessage(targetNode, chatbot);
        break;
        
      case 'carouselMessage':
        await this.sendCarouselMessage(targetNode, chatbot);
        break;
        
      default:
        console.log('⚠️ [CHATBOT] Unsupported node type:', nodeType);
        break;
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

    async sendMessageWithEdge(targetNode, chatbot) {
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

        console.log('📤 [CHATBOT] Sending message with edge:', {
          chatId,
          targetNodeData: data,
          messageText: data.message
        });

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

      const InstagramChatService = require('./InstagramChatService');
      const chatService = new InstagramChatService(null, accessToken);
      
      const response = await chatService.send({
        text: messageText,
        senderId: senderId
      });

      if (response && response.message_id) {
        await this.saveSentMessage(chatId, messageText, response.message_id);
        console.log('Instagram message sent successfully:', response.message_id);
      } else {
        console.error('Failed to send Instagram message:', response);
      }
      
    } catch (error) {
      console.error('Error calling Instagram API:', error);
    }
  }

  getSenderId() {
    let senderId = this.message.sender_id;
    
    if (!senderId) {
      try {
        const messageData = this.message.message || this.message;
        if (messageData.sender && messageData.sender.id) {
          senderId = messageData.sender.id;
        }
      } catch (error) {
        console.error('Error extracting sender ID from message:', error);
      }
    }
    
    return senderId;
  }

  async getAccountDetails(chatId) {
    try {
      const chat = await this.chatRepository.findWithAccountAndDisablity(chatId);
      if (!chat || !chat.account) {
        console.error('Chat or account not found for chat ID:', chatId);
        return null;
      }

      const { account } = chat;
      const accessToken = account.access_token || account.token || account.accessToken;
      const pageId = account.social_user_id || account.instagram_business_account_id || account.id;

      if (!accessToken || !pageId) {
        console.error('Missing access token or page ID for Instagram account');
        return null;
      }

      return { accessToken, pageId };
    } catch (error) {
      console.error('Error getting account details:', error);
      return null;
    }
  }

  async sendMessage(chatId, messageData, messageType = 'text') {
    try {
      const accountDetails = await this.getAccountDetails(chatId);
      if (!accountDetails) return false;

      const { accessToken } = accountDetails;
      const senderId = this.getSenderId();
      
      if (!senderId) {
        console.error('Sender ID not found in message');
        return false;
      }

      const InstagramChatService = require('./InstagramChatService');
      const chatService = new InstagramChatService(null, accessToken);
      
      let response;
      
      switch (messageType) {
        case 'text':
        case 'button':
        case 'list':
        case 'carousel':
          response = await chatService.send({
            text: messageData.text,
            senderId: senderId
          });
          break;
          
        case 'image':
          if (messageData.image && messageData.image.url) {
            response = await chatService.sendAttachment(
              messageData.image.url, 
              'image', 
              senderId
            );
          } else {
            console.error('❌ [IMAGE] No image URL provided');
            return false;
          }
          break;
          
        case 'audio':
          if (messageData.audio && messageData.audio.url) {
            response = await chatService.sendAttachment(
              messageData.audio.url, 
              'audio', 
              senderId
            );
          } else {
            console.error('❌ [AUDIO] No audio URL provided');
            return false;
          }
          break;
          
        case 'video':
          if (messageData.video && messageData.video.url) {
            response = await chatService.sendAttachment(
              messageData.video.url, 
              'video', 
              senderId
            );
          } else {
            console.error('❌ [VIDEO] No video URL provided');
            return false;
          }
          break;
          
        case 'document':
          if (messageData.document && messageData.document.url) {
            response = await chatService.sendAttachment(
              messageData.document.url, 
              'file', 
              senderId
            );
          } else {
            console.error('❌ [DOCUMENT] No document URL provided');
            return false;
          }
          break;
          
        default:
          console.error(`❌ [${messageType.toUpperCase()}] Unsupported message type: ${messageType}`);
          return false;
      }

      if (response && response.message_id) {
        await this.saveSentMessage(chatId, this.getMessageText(messageData, messageType), response.message_id);
        console.log(`✅ [${messageType.toUpperCase()}] Instagram ${messageType} message sent successfully:`, response.message_id);
        return true;
      } else {
        console.error(`❌ [${messageType.toUpperCase()}] Failed to send Instagram ${messageType} message:`, response);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ [${messageType.toUpperCase()}] Error sending ${messageType} message:`, error);
      return false;
    }
  }

  getMessageText(messageData, messageType) {
    switch (messageType) {
      case 'text':
        return messageData.text || '';
      case 'image':
        return `[Image: ${messageData.image?.caption || 'No caption'}]`;
      case 'audio':
        return `[Audio: ${messageData.audio?.caption || 'Audio message'}]`;
      case 'video':
        return `[Video: ${messageData.video?.caption || 'Video message'}]`;
      case 'document':
        return `[Document: ${messageData.document?.filename || 'Document'}]`;
      case 'location':
        return `[Location: ${messageData.location?.name || 'Location'}]`;
      case 'contact':
        return `[Contact: ${messageData.contact?.name || 'Contact'}]`;
      default:
        return `[${messageType}]`;
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

      
    } catch (error) {
      console.error('Error saving sent message:', error);
    }
  }

  async sendButtonMessage(targetNode, chatbot) {
    const { chat_id: chatId } = this.message;
    const { data } = targetNode;
    
    console.log('🔘 [BUTTON] Sending button message:', {
      nodeId: targetNode.node_id,
      buttonData: data
    });

    const buttons = data.buttons || [];
    const buttonText = data.text || 'Choose an option:';
    
    let messageText = buttonText + '\n\n';
    buttons.forEach((button, index) => {
      messageText += `${index + 1}. ${button.title}\n`;
    });
    
    await this.sendMessage(chatId, { text: messageText }, 'button');
  }

  async sendImageMessage(targetNode, chatbot) {
    const { chat_id: chatId } = this.message;
    const { data } = targetNode;
    
    console.log('🖼️ [IMAGE] Sending image message:', {
      nodeId: targetNode.node_id,
      imageUrl: data.imageUrl,
      caption: data.captions
    });

    await this.sendMessage(chatId, {
      image: {
        url: data.imageUrl,
        caption: data.captions || ''
      }
    }, 'image');
  }

  async sendAudioMessage(targetNode, chatbot) {
    const { chat_id: chatId } = this.message;
    const { data } = targetNode;
    
    console.log('🎵 [AUDIO] Sending audio message:', {
      nodeId: targetNode.node_id,
      audioUrl: data.audioUrl,
      caption: data.captions
    });

    await this.sendMessage(chatId, {
      audio: {
        url: data.audioUrl,
        caption: data.captions || ''
      }
    }, 'audio');
  }

  async sendVideoMessage(targetNode, chatbot) {
    const { chat_id: chatId } = this.message;
    const { data } = targetNode;
    
    console.log('🎬 [VIDEO] Sending video message:', {
      nodeId: targetNode.node_id,
      videoUrl: data.videoUrl,
      caption: data.captions
    });

    await this.sendMessage(chatId, {
      video: {
        url: data.videoUrl,
        caption: data.captions || ''
      }
    }, 'video');
  }

  async sendDocumentMessage(targetNode, chatbot) {
    const { chat_id: chatId } = this.message;
    const { data } = targetNode;
    
    console.log('📄 [DOCUMENT] Sending document message:', {
      nodeId: targetNode.node_id,
      documentUrl: data.documentUrl,
      filename: data.filename
    });

    await this.sendMessage(chatId, {
      document: {
        url: data.documentUrl,
        filename: data.filename || 'document'
      }
    }, 'document');
  }

  async sendLocationMessage(targetNode, chatbot) {
    const { chat_id: chatId } = this.message;
    const { data } = targetNode;
    
    console.log('📍 [LOCATION] Sending location message:', {
      nodeId: targetNode.node_id,
      latitude: data.latitude,
      longitude: data.longitude,
      name: data.name
    });

    await this.sendMessage(chatId, {
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        name: data.name || 'Location'
      }
    }, 'location');
  }

  async sendContactMessage(targetNode, chatbot) {
    const { chat_id: chatId } = this.message;
    const { data } = targetNode;
    
    console.log('👤 [CONTACT] Sending contact message:', {
      nodeId: targetNode.node_id,
      contactData: data
    });

    await this.sendMessage(chatId, {
      contact: {
        name: data.name,
        phone: data.phone,
        email: data.email
      }
    }, 'contact');
  }

  async sendListMessage(targetNode, chatbot) {
    const { chat_id: chatId } = this.message;
    const { data } = targetNode;
    
    console.log('📋 [LIST] Sending list message:', {
      nodeId: targetNode.node_id,
      listData: data
    });

    let messageText = data.title || 'Options:\n\n';
    if (data.items && data.items.length > 0) {
      data.items.forEach((item, index) => {
        messageText += `${index + 1}. ${item.title}\n`;
        if (item.description) {
          messageText += `   ${item.description}\n`;
        }
        messageText += '\n';
      });
    }
    
    await this.sendMessage(chatId, { text: messageText }, 'list');
  }

  async sendCarouselMessage(targetNode, chatbot) {
    const { chat_id: chatId } = this.message;
    const { data } = targetNode;
    
    console.log('🎠 [CAROUSEL] Sending carousel message:', {
      nodeId: targetNode.node_id,
      carouselData: data
    });

    let messageText = data.title || 'Options:\n\n';
    if (data.cards && data.cards.length > 0) {
      data.cards.forEach((card, index) => {
        messageText += `${index + 1}. ${card.title}\n`;
        if (card.description) {
          messageText += `   ${card.description}\n`;
        }
        if (card.imageUrl) {
          messageText += `   [Image: ${card.imageUrl}]\n`;
        }
        messageText += '\n';
      });
    }
    
    await this.sendMessage(chatId, { text: messageText }, 'carousel');
  }
}

module.exports = InstagramChatbotAutomationService;
