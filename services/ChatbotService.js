const PlanNoChatbotPermissionException = require("../exceptions/CustomExceptions/PlanNoChatbotPermissionException");
const ChatbotRepository = require("../repositories/chatbotRepository");

class ChatbotService {
  chatbotRepository;
  constructor() {
    this.chatbotRepository = new ChatbotRepository();
  }
  async addChatbot({ title, chats, flow, for_all, user }) {
    if (!user.plan?.allow_chatbot) {
      throw new PlanNoChatbotPermissionException();
    }

    const chatbot = {
      uid: user.uid,
      title,
      for_all: !!for_all,
      chats,
      flow,
      flow_id: flow?.id,
      active: true,
    };

    return this.chatbotRepository.create(chatbot);
  }

  async updateChatbot({ id, title, chats, flow, for_all, user }) {
    if (!user.plan?.allow_chatbot) {
      throw new PlanNoChatbotPermissionException();
    }

    const chatbot = {
      title,
      for_all: !!for_all,
      chats,
      flow,
      flow_id: flow?.id,
    };

    return this.chatbotRepository.update(id, chatbot, user.uid);
  }

  async getChatbots(uid) {
    return this.chatbotRepository.findByUid(uid);
  }

  async changeBotStatus(id, status, user) {
    if (!user.plan?.allow_chatbot) {
      throw new PlanNoChatbotPermissionException();
    }

    return this.chatbotRepository.updateStatus(id, !!status, user.uid);
  }

  async deleteChatbot(id, uid) {
    return this.chatbotRepository.delete(id, uid);
  }

}

module.exports = ChatbotService;
