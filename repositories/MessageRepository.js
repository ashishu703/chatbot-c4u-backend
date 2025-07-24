const { Message } = require("../models");
const { READ } = require("../types/conversation-status.types");
const Repository = require("./Repository");

class MessageRepository extends Repository {

  constructor() {
    super(Message);
  }


  async updateConversationStatus(messageId, status) {
    return this.update({ status }, { message_id: messageId });
  }

  async findByMessageId(messageId) {
    return this.findFirst({
      where: {
        message_id: messageId
      }
    })
  }

  async updateBody(messageId, body) {
    return this.update({ body }, { message_id: messageId });
  }

  async setConversationToRead(chatId) {
    await this.model.update({
      status: READ
    }, {
      where: {
        chat_id: chatId
      }
    });
    return this.find({
      chat_id: chatId
    });
  }
  async updateConversationReaction(messageId, reaction) {
    return this.update({ reaction }, { message_id: messageId });
  }

  async findInboxMessages(uid, chatId, query = {}) {
    return this.find({ where: { chat_id: chatId, uid }, order: [["createdAt", "ASC"]] });
  }
  async paginateInboxMessages(uid, chatId, query = {}) {
    return this.paginate({
      where: { chat_id: chatId, uid },
      orderDirection: "ASC",
      ...query
    });
  }




};
module.exports = MessageRepository