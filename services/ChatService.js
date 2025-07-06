const AgentChatRepository = require("../repositories/AgentChatRepository");
const ChatRepository = require("../repositories/ChatRepository");
const ContactRepository = require("../repositories/ContactRepository");
const AgentRepository = require("../repositories/AgentRepository");


class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.contactRepository = new ContactRepository();
    this.agentRepository = new AgentRepository();
    this.agentChatRepository = new AgentChatRepository();
  }

  

}

module.exports = ChatService;
