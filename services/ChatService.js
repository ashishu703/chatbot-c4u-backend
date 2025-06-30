const AgentChatRepository = require("../repositories/AgentChatRepository");
const ChatRepository = require("../repositories/ChatRepository");
const ContactRepository = require("../repositories/ContactRepository");
const AgentRepository = require("../repositories/AgentRepository");

const ChatNotFoundException = require("../exceptions/CustomExceptions/ChatNotFoundException");
const { mergeArrays } = require("../utils/others.utils");
const { OUTGOING } = require("../types/conversation-route.types");
const { SENT } = require("../types/conversation-status.types");
const { where } = require("sequelize");

class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.contactRepository = new ContactRepository();
    this.agentRepository = new AgentRepository();
    this.agentChatRepository = new AgentChatRepository();
  }

  

}

module.exports = ChatService;
