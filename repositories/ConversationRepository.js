const { Conversation } = require("../models");
const Repository = require("./Repository");

class ConversationRepository extends Repository {

  constructor() {
    super(Conversation);
  }


  async updateConversationStatus(messageId, status) {
    return this.update({ status }, { where: { message_id: messageId } });
  }
  async updateConversationReaction(messageId, reaction) {
    return this.update({ reaction }, { where: { message_id: messageId } });
  }

};
module.exports = ConversationRepository