const MessengerMessageHandler = require('./MessengerMessageHandler');
const { dataGet } = require("../../utils/others.utils");

class MessengerTextMessageHandler extends MessengerMessageHandler {
  async handleMessage(nodeData, chatbot) {
    await this.initApi();
    const { sender_id: senderId } = this.getChat();
    const { title: chatbotName } = chatbot;
    
    // Check if this node has interactive buttons/options
    if (nodeData.options && Array.isArray(nodeData.options) && nodeData.options.length > 0) {
      await this.sendInteractiveMessage(nodeData, chatbot);
    } else {
      await this.sendTextMessage(nodeData, chatbot);
    }
  }

  async sendInteractiveMessage(nodeData, chatbot) {
    const { sender_id: senderId } = this.getChat();
    const { title: chatbotName } = chatbot;
    
    // Extract message text
    let messageText = this.extractMessageText(nodeData);
    
    console.log('Debug: Sending interactive message:', messageText);
    console.log('Debug: Quick replies:', nodeData.options);
    
    // Check if we have a valid message text
    if (!messageText || messageText.trim() === '') {
      console.log('Debug: No message text found, skipping interactive message');
      return;
    }
    
    // Prepare quick replies
    const quickReplies = nodeData.options.map(option => ({
      content_type: "text",
      title: option.value,
      payload: option.value
    }));
    
    // Send interactive message with quick replies
    const response = await this.getMessengerApi().sendMessage({
      recipient: { id: senderId },
      message: {
        text: messageText,
        quick_replies: quickReplies
      },
      messaging_type: "RESPONSE",
    });

    // Save the outgoing message to database
    const messageId = dataGet(response, "message_id") || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.processOutgoingMessage({
      id: messageId,
      body: {
        text: messageText,
        reaction: "",
        type: "interactive",
        interactive: {
          type: "button_reply",
          button_reply: quickReplies
        }
      },
      type: "interactive",
      chat: this.getChat()
    });

    console.log(`Messenger interactive message sent via chatbot: ${chatbotName}`);
    return response;
  }

  async sendTextMessage(nodeData, chatbot) {
    const { sender_id: senderId } = this.getChat();
    const { title: chatbotName } = chatbot;
    
    // Extract message text
    let messageText = this.extractMessageText(nodeData);
    
    console.log('Debug: Sending text message:', messageText);
    
    // Only send if we have a valid message
    if (!messageText || messageText.trim() === '') {
      console.log('Debug: No message to send, skipping');
      return;
    }
    
    // Send text message
    const response = await this.getMessengerApi().sendMessage({
      recipient: { id: senderId },
      message: { text: messageText },
      messaging_type: "RESPONSE",
    });

    // Save the outgoing message to database
    const messageId = dataGet(response, "message_id") || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.processOutgoingMessage({
      id: messageId,
      body: {
        text: messageText,
        reaction: ""
      },
      type: "text",
      chat: this.getChat()
    });

    console.log(`Messenger text message sent via chatbot: ${chatbotName}`);
    return response;
  }

  extractMessageText(nodeData) {
    console.log('Debug: [Text Node] structure:', {
      hasMessage: !!nodeData.message,
      hasMsgContent: !!(nodeData.data?.state?.state?.msgContent),
      hasDataState: !!(nodeData.data && nodeData.data.state),
      messageValue: nodeData.message,
      msgContentValue: nodeData.data?.state?.state?.msgContent,
      dataStateValue: nodeData.data?.state?.state?.msgContent?.text?.body
    });
    
    // Priority order for message extraction
    if (nodeData.message) {
      console.log('Debug: Using direct message property:', nodeData.message);
      return nodeData.message;
    }
    
    if (nodeData.msgContent) {
      const msg = nodeData.msgContent.message || nodeData.msgContent.text || null;
      console.log('Debug: Using msgContent structure:', msg);
      return msg;
    }
    
    if (nodeData.data?.state) {
      const state = nodeData.data.state;
      if (state.message) {
        console.log('Debug: Using nested state message:', state.message);
        return state.message;
      }
      
      if (state.state?.msgContent) {
        const msg = state.state.msgContent.text?.body || null;
        console.log('Debug: Using nested state msgContent:', msg);
        return msg;
      }
    }
    
    console.log('Debug: Final extracted message text: null');
    return null;
  }
}

module.exports = MessengerTextMessageHandler; 