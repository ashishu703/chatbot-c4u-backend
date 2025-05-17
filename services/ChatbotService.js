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

    await this.chatbotRepository.create(chatbot);
    return true;
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

    await this.chatbotRepository.update(id, chatbot, user.uid);
    return true;
  }

   async getChatbots(uid) {
    return await this.chatbotRepository.findByUid(uid);
  }

   async changeBotStatus(id, status, user) {
    if (!user.plan?.allow_chatbot) {
      throw new new PlanNoChatbotPermissionException();
    }

    await this.chatbotRepository.updateStatus(id, !!status, user.uid);
    return true;
  }

   async deleteChatbot(id, uid) {
    await this.chatbotRepository.delete(id, uid);
    return true;
  }

   async makeRequestApi({ url, body, headers, type }) {
    const { makeRequest } = require("../functions/function");
    return await makeRequest({ method: type, url, body, headers });
  }
}

module.exports = ChatbotService;