const { ChatbotChat } = require("../models");
const Repository = require("./Repository");

class ChatbotChatRepository extends Repository {
  constructor() {
    super(ChatbotChat);
  }

  

}

module.exports = ChatbotChatRepository;
