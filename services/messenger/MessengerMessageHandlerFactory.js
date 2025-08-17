const MessengerTextMessageHandler = require('./MessengerTextMessageHandler');
const MessengerVideoMessageHandler = require('./MessengerVideoMessageHandler');
const MessengerImageMessageHandler = require('./MessengerImageMessageHandler');
const MessengerAudioMessageHandler = require('./MessengerAudioMessageHandler');
const MessengerDocumentMessageHandler = require('./MessengerDocumentMessageHandler');
const MessengerConditionMessageHandler = require('./MessengerConditionMessageHandler');

class MessengerMessageHandlerFactory {
  static createHandler(nodeType, chatbotService) {
    switch(nodeType) {
      case 'simpleMessage':
      case 'textMessage':
        return new MessengerTextMessageHandler(chatbotService);
      case 'videoMessage':
        return new MessengerVideoMessageHandler(chatbotService);
      case 'imageMessage':
        return new MessengerImageMessageHandler(chatbotService);
      case 'audioMessage':
        return new MessengerAudioMessageHandler(chatbotService);
      case 'documentMessage':
        return new MessengerDocumentMessageHandler(chatbotService);
      case 'condition':
        return new MessengerConditionMessageHandler(chatbotService);
      default:
        // Default to text handler for unknown types
        return new MessengerTextMessageHandler(chatbotService);
    }
  }
}

module.exports = MessengerMessageHandlerFactory; 