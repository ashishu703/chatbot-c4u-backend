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

};
module.exports = MessageRepository