const TypeTagException = require("../exceptions/CustomExceptions/TypeTagException");
const ChatService = require("../services/chatService");
const { __t } = require("../utils/locale.utils");
const {formSuccess} = require("../utils/response.utils");
class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  
}

module.exports = ChatController;
