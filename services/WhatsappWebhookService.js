const WhatsappMediaApi = require("../api/Whatsapp/WhatsappMediaApi");
const { backendURI } = require("../config/app.config");
const WhatsappWebhookDto = require("../dtos/Whatsapp/WhatsappWebhookDto");
const ProfileNotFoundException = require("../exceptions/CustomExceptions/ProfileNotFoundException");
const ChatRepository = require("../repositories/ChatRepository");
const MessageRepository = require("../repositories/MessageRepository");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const { OPEN } = require("../types/chat-status.types");
const { INCOMING } = require("../types/conversation-route.types");
const { SENT } = require("../types/conversation-status.types");
const { convertWebhookMessageToDBMessage, whatsappMessageDtoToSaveableBody } = require("../utils/messages.utils");
const ChatbotAutomationService = require("./ChatbotAutomationService");
const ChatIOService = require("./ChatIOService");
const WhatsappMediaService = require("./WhatsappMediaService");


class WhatsappWebhookService {


  constructor(user = null, accessToken = null) {
    this.socialAccountRepository = new SocialAccountRepository();
    this.chatRepository = new ChatRepository();
    this.messageRepository = new MessageRepository();
    this.whatsappMediaApi = new WhatsappMediaApi();
    this.ioService = new ChatIOService();
  }



  async processIncomingWebhook(payload) {
    const { entry } = payload;
    entry.forEach(async (entryObj) => {
      const webhookDto = new WhatsappWebhookDto(entryObj);

      const changes = webhookDto.getChanges();

      const account = await this.socialAccountRepository.findFirst({
        where: { social_account_id: webhookDto.getWabaId() }
      })

      if (!account) {
        throw new ProfileNotFoundException();
      }

      changes?.forEach(async (change) => {
        await this.processWebhookEntry(change, account);
      });


    });
  }

  async processWebhookEntry(messageObj, whatsappProfile) {
    try {
      let chatId = messageObj.getChatId();

      let chat = await this.chatRepository.findFirst({
        where: { chat_id: chatId, account_id: whatsappProfile.id }
      }, ["agentChat"]);

      if (!chat && !messageObj.isMessageEvent())
        return;

      if (!chat) {
        chat = await this.createNewChat(
          chatId,
          whatsappProfile,
          messageObj
        );
      }

      await this.ioService.setChat(chat).init();

      if (messageObj.isMessageEvent()) {
        const messages = messageObj.getMessages();
        messages?.forEach(async (message) => {
          await this.processIncomingMessage(message, chat, whatsappProfile);
        });
      }
      else if (messageObj.isDeliveryStatus()) {
        const statuses = messageObj.getStatuses();
        statuses?.forEach((status) => {
          this.processDeliveryMessage(status);
        });
      }
    } catch (error) {
      console.log({
        error
      })
      return false;
    }
  }

  async createNewChat(chatId, whatsappProfile, messageObj) {

    const senderName = messageObj.getTargetName();
    const senderId = messageObj.getTargetPhoneNo();

    return this.chatRepository.createIfNotExists(
      {
        chat_id: chatId,
        avatar: "",
        uid: whatsappProfile.uid,
        account_id: whatsappProfile.id,
        chat_note: "",
        chat_tags: [],
        sender_name: senderName,
        sender_id: senderId,
        chat_status: OPEN,
      },
      {
        chat_id: chatId,
        uid: whatsappProfile.uid
      }
    );
  }


  async processIncomingMessage(messageObj, chat, whatsappProfile) {
    const chatId = chat.id;

    if (messageObj.isReaction()) {
      await this.processReaction(messageObj);
    }
    else {
      if (messageObj.hasAttachment()) {
        const attachmentId = messageObj.getAttachmentId();
        await this.whatsappMediaApi.initMeta();
        const attachmentUrl = await (new WhatsappMediaService(null, whatsappProfile.token))
          .downloadAndSaveMedia(attachmentId);
        messageObj.setAttachmentUrl(`${backendURI}/meta-media/${attachmentUrl}`);
      }

      const message = await this.messageRepository.createIfNotExists(
        {
          timestamp: messageObj.getMessageTimestamp(),
          message_id: messageObj.getId(),
          type: messageObj.getType(),
          body: whatsappMessageDtoToSaveableBody(messageObj),
          status: SENT,
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
        message.id,
        messageObj.getMessageTimestamp()
      );
      this.ioService.emitUpdateConversationEvent();
      await (new ChatbotAutomationService(message)).initBot();
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
    const status = messageObj.getStatus();
    const message = await this.messageRepository.updateConversationStatus(mid, status);
    this.ioService.emitUpdateDeliveryEvent(message);
  }


};


module.exports = WhatsappWebhookService
