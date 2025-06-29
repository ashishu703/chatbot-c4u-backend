
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
const SocketHelper = require("./../helper/SocketHelper");
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
      }
    } catch (error) {
      return false;
    }
  }

  async createNewChat(chatId, instagramProfile, messageObj) {

    const senderId = messageObj.getTargetId();
    await this.instagramProfileApi.initMeta();
    const {
      name,
      profile_pic
    } = await this.instagramProfileApi.setToken(instagramProfile.token)
      .fetchProfile(senderId);


    return this.chatRepository.createIfNotExists(
      {
        "chat_id": chatId,
        "avatar": profile_pic,
        "uid": instagramProfile.uid,
        "account_id": instagramProfile.id,
        "chat_note": "",
        "chat_tags": [],
        "sender_name": name,
        "sender_id": senderId,
        "chat_status": OPEN,
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
        owner_id: chat.uid,
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
        owner_id: chat.uid,
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
