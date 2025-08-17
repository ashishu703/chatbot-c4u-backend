const MessengerMessageHandler = require('./MessengerMessageHandler');
const MessangerChatService = require('../MessangerChatService');
const { dataGet } = require("../../utils/others.utils");

class MessengerImageMessageHandler extends MessengerMessageHandler {
  async handleMessage(nodeData, chatbot) {
    await this.initApi();
    const { sender_id: senderId } = this.getChat();
    const { title: chatbotName } = chatbot;
    
    console.log('Debug: Sending image message for node:', nodeData);
    
    // Extract image URL and caption
    const imageUrl = nodeData.imageUrl || nodeData.data?.state?.state?.msgContent?.image?.link;
    const caption = this.extractMessageText(nodeData);
    
    console.log('Debug: Image URL:', imageUrl);
    console.log('Debug: Image caption:', caption);
    
    if (!imageUrl) {
      console.error('Debug: No image URL found in node data');
      return;
    }
    
    try {
      // Send image using MessangerChatService
      const chatService = new MessangerChatService(null, this.getChat().page.token);
      const response = await chatService.sendImage({ senderId, url: imageUrl });
      
      console.log('Debug: Image sent successfully:', response);
      
      // Save the outgoing image message to database
      const messageId = dataGet(response, "message_id") || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.processOutgoingMessage({
        id: messageId,
        body: {
          text: caption || "",
          attchment_url: imageUrl,
          reaction: "",
          type: "image"
        },
        type: "image",
        chat: this.getChat()
      });
      
      // If there's a caption, send it as a separate text message WITH quick replies
      if (caption && caption.trim() !== '') {
        // Prepare quick replies for buttons
        const quickReplies = nodeData.options.map(option => ({
          content_type: "text",
          title: option.value,
          payload: option.value
        }));
        
        console.log('Debug: Sending caption with quick replies:', caption);
        console.log('Debug: Quick replies:', quickReplies);
        
        await this.getMessengerApi().sendMessage({
          recipient: { id: senderId },
          message: {
            text: caption,
            quick_replies: quickReplies
          },
          messaging_type: "RESPONSE",
        });
        
        // Save the caption message with quick replies to database
        const captionMessageId = `caption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.processOutgoingMessage({
          id: captionMessageId,
          body: {
            text: caption,
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
      }
      
      console.log(`Messenger image message sent via chatbot: ${chatbotName}`);
      return response;
      
    } catch (error) {
      console.error('Debug: Error sending image message:', error);
      throw error;
    }
  }

  extractMessageText(nodeData) {
    
    const caption = nodeData.captions || nodeData.data?.state?.state?.msgContent?.image?.caption;
    console.log('Debug: [Image Node] captions:', nodeData.captions);
    console.log('Debug: [Image Node] nested caption:', nodeData.data?.state?.state?.msgContent?.image?.caption);
    console.log('Debug: Final extracted image caption:', caption);
    return caption;
  }
}

module.exports = MessengerImageMessageHandler; 