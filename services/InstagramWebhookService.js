
const {
  convertWebhookMessageToDBMessage,
} = require("../utils/messages.utils");
const ChatIOService = require("./ChatIOService");
const ProfileNotFoundException = require("../exceptions/CustomExceptions/ProfileNotFoundException");
const ChatRepository = require("../repositories/ChatRepository");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const InstagramProfileApi = require("../api/Instagram/InstagramProfileApi");
const MessageRepository = require("../repositories/MessageRepository");
const { OPEN } = require("../types/chat-status.types");
const InstagramWebhookDto = require("../dtos/Instagram/InstagramWebhookDto");
const { READ } = require("../types/conversation-status.types");
const { OUTGOING, INCOMING } = require("../types/conversation-route.types");
const InstagramChatbotAutomationService = require("./InstagramChatbotAutomationService");
const InstagramCommentAutomationService = require("./InstagramCommentAutomationService");
class InstagramWebhookService {


  constructor(user = null, accessToken = null) {
    this.chatRepository = new ChatRepository();
    this.socialAccountRepository = new SocialAccountRepository();
    this.instagramProfileApi = new InstagramProfileApi(user, accessToken);
    this.messageRepository = new MessageRepository();
    this.ioService = new ChatIOService();
  }


  async processIncomingWebhook(payload) {
    const { entry } = payload;
    
    // Process comment automation first
    try {
      const commentAutomationService = new InstagramCommentAutomationService();
      await commentAutomationService.processComment(payload);
    } catch (error) {
      console.error('Error processing comment automation:', error);
    }
    
    entry.forEach((entryObj) => {
      const webhookDto = new InstagramWebhookDto(entryObj);

      if (webhookDto.isMessage()) {
        const messages = webhookDto.getMessages();

        messages?.forEach(async (messageObj) => {
          await this.processWebhookEntry(messageObj);
        });
      }

      if (webhookDto.isChange()) {
        const changes = webhookDto.getChanges();
        changes?.forEach(async (change) => {
          await this.processChanges(change);
        });
      }
    });
  }

  async processWebhookEntry(messageObj) {
    try {


      let ownerId = messageObj.getOwnerId();

      let chatId = messageObj.getChatId();

      let instagramProfile =
        await this.socialAccountRepository.findFirst({
          where: { social_user_id: ownerId }
        });


      if (!instagramProfile) {
        throw new ProfileNotFoundException();
      }



      let chat = await this.chatRepository.findFirst({
        where: { chat_id: chatId, account_id: instagramProfile.id }
      }, ["agentChat"]);

      if (!chat) {
        chat = await this.createNewChat(
          chatId,
          instagramProfile,
          messageObj
        );
      }



      await this.ioService.setChat(chat).init();


      if (messageObj.isDeliveryReceipt()) {
        await this.processDeliveryReciept(messageObj, chat);
      } else if (messageObj.isMessage()) {
        await this.processIncomingMessage(messageObj, chat);
      } else if (messageObj.isReaction()) {
        await this.processReaction(messageObj);
      }

      await this.ioService.emitUpdateConversationEvent();
    } catch (error) {
      console.log({
        error
      })
      return false;
    }
  }

  async processChanges(change) {
    try {
      if (change.isMessageSeenEvent()) {
        const sender = change.getSenderId();
        const instagramProfile = await this.socialAccountRepository.findFirst({
          social_user_id: sender
        });


        if (!instagramProfile) {
          throw new ProfileNotFoundException();
        }

        const chatId = change.getChatId();

        const chat = await this.chatRepository.findFirst({
          where: { chat_id: chatId, account_id: instagramProfile.id }
        }, ["agentChat"]);


        await this.ioService.setChat(chat).init();

        await this.processDeliveryMessage(change, chat);

        await this.ioService.emitUpdateConversationEvent();
      } else if (change.field === 'comments' && change.value) {
        // Handle comment events for automation
        try {
          const commentAutomationService = new InstagramCommentAutomationService();
          await commentAutomationService.handleNewComment(change.value, change.id);
        } catch (error) {
          console.error('Error processing comment automation:', error);
        }
      }
    } catch (error) {
      return false;
    }
  }

  async createNewChat(chatId, instagramProfile, messageObj) {

    const senderId = messageObj.getTargetId();
    await this.instagramProfileApi.initMeta();
    let name = "";
    let profile_pic = null;
    try {
      const resp = await this.instagramProfileApi
        .setToken(instagramProfile.token)
        .fetchProfile(senderId);
      name = resp?.name || "";
      profile_pic = resp?.profile_pic || null;
    } catch (e) {
      console.error("Instagram fetchProfile failed (non-blocking):", e?.message || e);
    }


    return this.chatRepository.createIfNotExists(
      {
        chat_id: chatId,
        avatar: profile_pic,
        uid: instagramProfile.uid,
        account_id: instagramProfile.id,
        chat_note: "",
        chat_tags: [],
        sender_name: name,
        sender_id: senderId,
        chat_status: OPEN,
      },
      {
        chat_id: chatId,
        uid: instagramProfile.uid
      }
    );
  }

  async processDeliveryReciept(messageObj, chat) {
    const chatId = chat.id;

    const dbMessageObj = convertWebhookMessageToDBMessage(messageObj);
   
    const message = await this.messageRepository.createIfNotExists(
      {
        ...dbMessageObj,
        uid: chat.uid,
        chat_id: chatId,
        route: OUTGOING,
      },
      {
        message_id: messageObj.getId(),
        chat_id: chatId,
      }
    );

    this.ioService.emitNewMsgEvent(message);
    await this.chatRepository.updateLastMessage(
      chatId,
      message.id
    );
  }

  async processIncomingMessage(messageObj, chat) {
    const chatId = chat.id;
    const dbMessageObj = convertWebhookMessageToDBMessage(messageObj);

    const message = await this.messageRepository.createIfNotExists(
      {
        ...dbMessageObj,
        uid: chat.uid,
        chat_id: chatId,
        route: INCOMING,
      },
      {
        message_id: messageObj.getId(),
        chat_id: chatId,
      }
    );
    
    this.ioService.emitNewMsgEvent(message);
    await this.chatRepository.updateLastMessage(
      chatId,
      message.id
    );

    // Trigger chatbot automation for incoming messages
    try {
      // Extract sender ID from the original webhook data
      let senderId = null;
      
      // Try multiple methods to get sender ID
      try {
        // Method 1: Try to get sender ID directly from message object
        if (messageObj.getSenderId) {
          senderId = messageObj.getSenderId();
          console.log('Method 1 - getSenderId():', senderId);
        }
        
        // Method 2: Try to parse webhook data
        if (!senderId && messageObj.getWebhookData) {
          const webhookData = JSON.parse(messageObj.getWebhookData());
          console.log('Method 2 - Parsed webhook data:', JSON.stringify(webhookData, null, 2));
          
          if (webhookData.entry && webhookData.entry[0] && webhookData.entry[0].messaging) {
            const messaging = webhookData.entry[0].messaging[0];
            senderId = messaging.sender?.id;
            console.log('Method 2 - Extracted sender ID from webhook:', senderId);
          }
        }
        
        // Method 3: Try regex extraction from raw webhook string
        if (!senderId && messageObj.getWebhookData) {
          const rawWebhook = messageObj.getWebhookData();
          if (rawWebhook && typeof rawWebhook === 'string') {
            const match = rawWebhook.match(/"sender":\{"id":"([^"]+)"/);
            if (match) {
              senderId = match[1];
              console.log('Method 3 - Regex extracted sender ID:', senderId);
            }
          }
        }
        
        // Method 4: Try to get from message object properties
        if (!senderId && messageObj.sender_id) {
          senderId = messageObj.sender_id;
          console.log('Method 4 - Direct sender_id property:', senderId);
        }
        
      } catch (e) {
        console.log('Error in sender ID extraction:', e.message);
      }
      
      console.log('Final extracted sender ID:', senderId);

      const chatbotMessage = {
        ...message,
        chat_id: chatId,
        uid: chat.uid,
        route: INCOMING,
        sender_id: senderId
      };
      
      await (new InstagramChatbotAutomationService(chatbotMessage)).initBot();
    } catch (error) {
      console.error('Instagram Chatbot Automation Error:', error);
    }
  }

  async processReaction(messageObj) {
    const mid = messageObj.getId();

    let message = await this.messageRepository.findByMessageId(mid);

    if (!message) return;

    const { body } = message;


    message = await this.messageRepository.updateBody(mid, {
      ...body,
      reaction: messageObj.getEmoji(),
    });


    this.ioService.emitNewReactionEvent(message);

  }

  async processDeliveryMessage(messageObj) {
    const mid = messageObj.getId();
    return this.messageRepository.updateConversationStatus(mid, READ);
  }





};


module.exports = InstagramWebhookService
