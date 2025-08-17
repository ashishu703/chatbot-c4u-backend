const MessengerMessageHandler = require('./MessengerMessageHandler');
const MessangerChatService = require('../MessangerChatService');
const { dataGet } = require("../../utils/others.utils");

class MessengerDocumentMessageHandler extends MessengerMessageHandler {
  async handleMessage(nodeData, chatbot) {
    await this.initApi();
    const { sender_id: senderId } = this.getChat();
    const { title: chatbotName } = chatbot;
    
    console.log('Debug: Sending document message for node:', nodeData);
    
    // Extract document URL and caption
    const documentUrl = nodeData.documentUrl || nodeData.data?.state?.documentUrl;
    const caption = this.extractMessageText(nodeData);
    
    console.log('Debug: Document URL:', documentUrl);
    console.log('Debug: Document caption:', caption);
    
    if (!documentUrl) {
      console.error('Debug: No document URL found in node data');
      return;
    }
    
    // Check if URL is a blob URL (local browser URL that Facebook can't access)
    if (documentUrl.startsWith('blob:')) {
      console.error('Debug: Blob URL detected - Facebook cannot access local blob URLs');
      console.error('Debug: Please upload document to a public URL (e.g., Cloudinary, AWS S3)');
      
      // Send only the caption with quick replies since document can't be sent
      if (caption && caption.trim() !== '') {
        console.log('Debug: Sending caption only (document cannot be sent):', caption);
        
        // Prepare quick replies for buttons
        const quickReplies = nodeData.options.map(option => ({
          content_type: "text",
          title: option.value,
          payload: option.value
        }));
        
        await this.getMessengerApi().sendMessage({
          recipient: { id: senderId },
          message: {
            text: `${caption}\n\n⚠️ Note: Document could not be sent due to invalid URL format.`,
            quick_replies: quickReplies
          },
          messaging_type: "RESPONSE",
        });
        
        // Save the caption message to database
        const captionMessageId = `caption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.processOutgoingMessage({
          id: captionMessageId,
          body: {
            text: `${caption}\n\n⚠️ Note: Document could not be sent due to invalid URL format.`,
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
      
      console.log(`Messenger document message (caption only) sent via chatbot: ${chatbotName}`);
      return;
    }
    
    try {
      // Send document using MessangerChatService
      const chatService = new MessangerChatService(null, this.getChat().page.token);
      const response = await chatService.sendDoc({ senderId, url: documentUrl });
      
      console.log('Debug: Document sent successfully:', response);
      
      // Save the outgoing document message to database
      const messageId = dataGet(response, "message_id") || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.processOutgoingMessage({
        id: messageId,
        body: {
          text: caption || "",
          attchment_url: documentUrl,
          reaction: "",
          type: "document"
        },
        type: "document",
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
      
      console.log(`Messenger document message sent via chatbot: ${chatbotName}`);
      return response;
      
    } catch (error) {
      console.error('Debug: Error sending document message:', error);
      throw error;
    }
  }

  extractMessageText(nodeData) {
    // Handle document message nodes
    const caption = nodeData.captions || nodeData.data?.state?.documentCaption;
    console.log('Debug: [Document Node] captions:', nodeData.captions);
    console.log('Debug: [Document Node] nested caption:', nodeData.data?.state?.documentCaption);
    console.log('Debug: Final extracted document caption:', caption);
    return caption;
  }
}

module.exports = MessengerDocumentMessageHandler; 