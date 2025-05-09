const ChatbotRepository = require("../repositories/chatbotRepository");

class ChatbotService {
  chatbotRepository;
  constructor() {
    this.chatbotRepository = new ChatbotRepository();
  }
   async addChatbot({ title, chats, flow, for_all, user }) {
    if (!user.plan?.allow_chatbot) {
      throw new Error("Your plan does not allow you to set a chatbot");
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
    return { success: true, msg: "Chatbot was added" };
  }

   async updateChatbot({ id, title, chats, flow, for_all, user }) {
    if (!user.plan?.allow_chatbot) {
      throw new Error("Your plan does not allow you to set a chatbot");
    }

    const chatbot = {
      title,
      for_all: !!for_all,
      chats,
      flow,
      flow_id: flow?.id,
    };

    await this.chatbotRepository.update(id, chatbot, user.uid);
    return { success: true, msg: "Chatbot was updated" };
  }

   async getChatbots(uid) {
    return await this.chatbotRepository.findByUid(uid);
  }

   async changeBotStatus(id, status, user) {
    if (!user.plan?.allow_chatbot) {
      throw new Error("Your plan does not allow you to set a chatbot");
    }

    await this.chatbotRepository.updateStatus(id, !!status, user.uid);
    return { success: true, msg: "Chatbot was updated" };
  }

   async deleteChatbot(id, uid) {
    await this.chatbotRepository.delete(id, uid);
    return { success: true, msg: "Chatbot was deleted" };
  }

   async makeRequestApi({ url, body, headers, type }) {
    const { makeRequest } = require("../functions/function");
    return await makeRequest({ method: type, url, body, headers });
  }
}

module.exports = ChatbotService;