const ChatbotRepository = require("../repositories/ChatbotRepository");
const UserRepository = require("../repositories/UserRepository");

class ChatbotService {
  chatbotRepository;
  constructor() {
    this.chatbotRepository = new ChatbotRepository();
    this.userRepository = new UserRepository();
  }
  async addChatbot({
    title,
    chats,
    flow_id,
    for_all,
    uid
  }) {

    return this.chatbotRepository.createAndAttachChats({
      uid,
      title,
      for_all: !!for_all,
      flow_id,
    }, chats);

  }

  async updateChatbot(chatbotId, {
    title,
    chats,
    flow_id,
    for_all,
    uid,
  }) {
    return this.chatbotRepository.updateAndAttachChats(chatbotId, {
      title,
      for_all: !!for_all,
      flow_id,
      uid,
    }, chats);
  }

  async getChatbots(query) {
    return this.chatbotRepository.paginate(query);
  }

  async changeBotStatus({ id, status, uid }) {
    return this.chatbotRepository.updateStatus(id, status, uid);
  }

  async deleteChatbot(id, uid) {
    return this.chatbotRepository.deletechatbot(id, uid);
  }
}

module.exports = ChatbotService;
