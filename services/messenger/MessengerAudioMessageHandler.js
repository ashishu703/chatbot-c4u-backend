const MessengerMessageHandler = require('./MessengerMessageHandler');
const MessangerChatService = require('../MessangerChatService');
const { dataGet } = require("../../utils/others.utils");

class MessengerAudioMessageHandler extends MessengerMessageHandler {
  async handleMessage(nodeData, chatbot) {
    await this.initApi();
    const { sender_id: senderId } = this.getChat();
    const { title: chatbotName } = chatbot;
    
    console.log('Debug: Sending audio message for node:', nodeData);
    
    // Extract audio URL and caption
    const audioUrl = nodeData.audioUrl || nodeData.data?.state?.audioUrl;
    const caption = this.extractMessageText(nodeData);
    
    console.log('Debug: Audio URL:', audioUrl);
    console.log('Debug: Audio caption:', caption);
    
    if (!audioUrl) {
      console.error('Debug: No audio URL found in node data');
      return;
    }
    
    try {
      // Send audio using MessangerChatService
      const chatService = new MessangerChatService(null, this.getChat().page.token);
      const response = await chatService.sendAudio({ senderId, url: audioUrl });
      
      console.log('Debug: Audio sent successfully:', response);
      
      // Save the outgoing audio message to database
      const messageId = dataGet(response, "message_id") || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.processOutgoingMessage({
        id: messageId,
        body: {
          text: caption || "",
          attchment_url: audioUrl,
          reaction: "",
          type: "audio"
        },
        type: "audio",
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
      
      console.log(`Messenger audio message sent via chatbot: ${chatbotName}`);
      return response;
      
    } catch (error) {
      console.error('Debug: Error sending audio message:', error);
      throw error;
    }
  }

  extractMessageText(nodeData) {
    // Handle audio message nodes
    const caption = nodeData.captions || nodeData.data?.state?.audioCaption;
    console.log('Debug: [Audio Node] captions:', nodeData.captions);
    console.log('Debug: [Audio Node] nested caption:', nodeData.data?.state?.audioCaption);
    console.log('Debug: Final extracted audio caption:', caption);
    return caption;
  }
}

module.exports = MessengerAudioMessageHandler; 