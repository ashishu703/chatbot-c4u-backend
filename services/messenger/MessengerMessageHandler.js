class MessengerMessageHandler {
  constructor(chatbotService) {
    this.chatbotService = chatbotService;
  }
  
  async handleMessage(nodeData, chatbot) {
    throw new Error('handleMessage method must be implemented');
  }
  
  async initApi() {
    await this.chatbotService.initApi();
  }
  
  getChat() {
    return this.chatbotService.chat;
  }
  
  getMessengerApi() {
    return this.chatbotService.messengerApi;
  }
  
  async processOutgoingMessage(messageData) {
    return await this.chatbotService.processOutgoingMessage(messageData);
  }
}

module.exports = MessengerMessageHandler; 