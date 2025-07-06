const ChatService = require("../services/ChatService");
const { __t } = require("../utils/locale.utils");
const {formSuccess} = require("../utils/response.utils");
class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  
}

module.exports = ChatController;
