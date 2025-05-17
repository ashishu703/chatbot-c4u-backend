const {
  UPDATE_CONVERSATION,
  PUSH_NEW_MSG,
  PUSH_NEW_REACTION,
  UPDATE_DELIVERY_STATUS,
} = require("../constants/socket.constant");
const IOService = require("./IOService");

module.exports = class ChatIOService extends IOService {
  constructor(uid) {
    super(uid);
  }

  updateConversation(chats) {
    this.emit(UPDATE_CONVERSATION, chats);
  }

  pushNewMsg(message) {
    this.emit(PUSH_NEW_MSG, message);
  }

  pushNewReaction(reaction) {
    this.emit(PUSH_NEW_REACTION, reaction);
  }

  pushUpdateDelivery(status) {
    this.emit(UPDATE_DELIVERY_STATUS, status);
  }
};
