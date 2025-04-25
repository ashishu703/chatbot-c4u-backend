const ChatbotRepository = require("../repositories/chatbotRepository");

class ChatbotService {
  static async addChatbot({ title, chats, flow, for_all, user }) {
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

    await ChatbotRepository.create(chatbot);
    return { success: true, msg: "Chatbot was added" };
  }

  static async updateChatbot({ id, title, chats, flow, for_all, user }) {
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

    await ChatbotRepository.update(id, chatbot, user.uid);
    return { success: true, msg: "Chatbot was updated" };
  }

  static async getChatbots(uid) {
    return await ChatbotRepository.findByUid(uid);
  }

  static async changeBotStatus(id, status, user) {
    if (!user.plan?.allow_chatbot) {
      throw new Error("Your plan does not allow you to set a chatbot");
    }

    await ChatbotRepository.updateStatus(id, !!status, user.uid);
    return { success: true, msg: "Chatbot was updated" };
  }

  static async deleteChatbot(id, uid) {
    await ChatbotRepository.delete(id, uid);
    return { success: true, msg: "Chatbot was deleted" };
  }

  static async makeRequestApi({ url, body, headers, type }) {
    const { makeRequest } = require("../functions/function");
    return await makeRequest({ method: type, url, body, headers });
  }
}

module.exports = ChatbotService;