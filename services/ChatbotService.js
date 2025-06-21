const PlanNoChatbotPermissionException = require("../exceptions/CustomExceptions/PlanNoChatbotPermissionException");
const ChatbotRepository = require("../repositories/ChatbotRepository");
const UserRepository = require("../repositories/UserRepository");

class ChatbotService {
  chatbotRepository;
  constructor() {
    this.chatbotRepository = new ChatbotRepository();
    this.userRepository = new UserRepository();
  }
  async addChatbot({ title, chats, flow, for_all, user: userObj }) {
    const user = await this.userRepository.findByUid(userObj.uid);

    if (user.plan) {
      const plan = JSON.parse(user.plan);
      if (!plan.allow_chatbot) {
        throw new PlanNoChatbotPermissionException();
      }
    } else {
      throw new PlanNoChatbotPermissionException();
    }

    const chatbot = {
      uid: user.uid,
      title,
      for_all: !!for_all ? 1 : 0,
      chats: JSON.stringify(chats),
      flow: JSON.stringify(flow),
      flow_id: flow?.id || null,
      active: 1,
    };

    return this.chatbotRepository.create(chatbot);
  }

  async updateChatbot({ id, title, chats, flow, for_all, user: userObj }) {
    const user = await this.userRepository.findByUid(userObj.uid);

    if (user.plan) {
      const plan = JSON.parse(user.plan);
      if (!plan.allow_chatbot) {
        throw new PlanNoChatbotPermissionException();
      }
    } else {
      throw new PlanNoChatbotPermissionException();
    }

    const chatbot = {
      title,
      for_all: !!for_all ? 1 : 0,
      chats: JSON.stringify(chats),
      flow: JSON.stringify(flow),
      flow_id: flow?.id ? parseInt(flow.id) : null,
    };

    const updateResult = await this.chatbotRepository.update(chatbot, {
      id: parseInt(id),
      uid: user.uid,
    });

    return updateResult;
  }

  async getChatbots(query) {
    return this.chatbotRepository.paginate(query);
  }

  async changeBotStatus( id, status, userObj) {
    const user = await this.userRepository.findByUid(userObj.uid);
    if (user.plan) {
      const plan = JSON.parse(user.plan);
      if (!plan.allow_chatbot) {
        throw new PlanNoChatbotPermissionException();
      }
    } else {
      throw new PlanNoChatbotPermissionException();
    }

    return this.chatbotRepository.updateStatus(id, status, user.uid);
  }

  async deleteChatbot(id, uid) {
    return this.chatbotRepository.deletechatbot(id, uid);
  }
}

module.exports = ChatbotService;
