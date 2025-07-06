const WhatsappMessageApi = require("../api/Whatsapp/WhatsappMessageApi");
const WhatsappMessageDto = require("../dtos/Whatsapp/WhatsappMessageDto");
const ChatRepository = require("../repositories/ChatRepository");
const MessageRepository = require("../repositories/MessageRepository");
const { OUTGOING } = require("../types/conversation-route.types");
const { PENDING } = require("../types/conversation-status.types");
const { TEXT, AUDIO, IMAGE, VIDEO, DOCUMENT } = require("../types/message.types");
const { getCurrentTimeStampInSeconds } = require("../utils/date.utils");
const { whatsappMessageDtoToSaveableBody } = require("../utils/messages.utils");
const { dataGet } = require("../utils/others.utils");
const ChatIOService = require("./ChatIOService");


class WhatsappChatService {


  constructor(user = null, accessToken = null) {
    this.chatRepository = new ChatRepository();
    this.messageRepository = new MessageRepository();
    this.messageApi = new WhatsappMessageApi(user, accessToken);
    this.ioService = new ChatIOService();
  }

  async storeMessage(chat, apiResponse, dto) {
    const messageId = dataGet(apiResponse, "messages.0.id");
    return this.processOutgoingMessage({
      id: messageId,
      body: whatsappMessageDtoToSaveableBody(dto),
      type: dto.getType(),
      chat
    });
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
        status: PENDING,
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

  async sendText(chat, { wabaId, senderId, text }) {

    await this
      .messageApi
      .setWabaId(wabaId)
      .initMeta();

    const dto = new WhatsappMessageDto({
      to: senderId,
      type: TEXT,
      text: {
        preview_url: true,
        body: text
      }
    });

    await this.send(chat, dto);

  }


  async sendImage(chat, { wabaId, senderId, url, text }) {
    await this
      .messageApi
      .setWabaId(wabaId)
      .initMeta();

    await this.sendAttachment(chat, wabaId, senderId, url, IMAGE, text);

  }

  async sendVideo(chat, { wabaId, senderId, url, text }) {
    await this
      .messageApi
      .setWabaId(wabaId)
      .initMeta();

    await this.sendAttachment(chat, wabaId, senderId, url, VIDEO, text);

  }

  async sendDoc(chat, { wabaId, senderId, url, text }) {
    await this
      .messageApi
      .setWabaId(wabaId)
      .initMeta();

    await this.sendAttachment(chat, wabaId, senderId, url, DOCUMENT, text);

  }

  async sendAudio(chat, { wabaId, senderId, url }) {

    await this
      .messageApi
      .setWabaId(wabaId)
      .initMeta();

    await this.sendAttachment(chat, wabaId, senderId, url, AUDIO);


  }

  async sendAttachment(chat, wabaId, senderId, url, type, caption = undefined) {
    await this
      .messageApi
      .setWabaId(wabaId)
      .initMeta();


    const dto = new WhatsappMessageDto({
      type,
      to: senderId,
      [type]: {
        link: url,
        caption
      }
    });
    await this.send(chat, dto);

  }

  async send(chat, dto) {
    const payload = dto.getContent();
    const result = await this.messageApi.send(payload);
    return this.storeMessage(chat, result, dto);
  }



};


module.exports = WhatsappChatService
