const { Message } = require("../models");
const Repository = require("./Repository");

class MessageRepository extends Repository {

  constructor() {
    super(Message);
  }


  async updateConversationStatus(messageId, status) {
    return this.update({ status }, { where: { message_id: messageId } });
  }
  async updateConversationReaction(messageId, reaction) {
    return this.update({ reaction }, { where: { message_id: messageId } });
  }

};
module.exports = MessageRepository