const MessengerMessageHandler = require('./MessengerMessageHandler');
const MessangerChatService = require('../MessangerChatService');
const { dataGet } = require("../../utils/others.utils");

class MessengerVideoMessageHandler extends MessengerMessageHandler {
  async handleMessage(nodeData, chatbot) {
    await this.initApi();
    const { sender_id: senderId } = this.getChat();
    const { title: chatbotName } = chatbot;
    
    console.log('Debug: Sending video message for node:', nodeData);
    
    // Extract video URL and caption
    const videoUrl = nodeData.videoUrl || nodeData.data?.state?.state?.msgContent?.video?.link;
    const caption = this.extractMessageText(nodeData);
    
    console.log('Debug: Video URL:', videoUrl);
    console.log('Debug: Video caption:', caption);
    
    if (!videoUrl) {
      console.error('Debug: No video URL found in node data');
      return;
    }
    
    try {
      // Send video using MessangerChatService
      const chatService = new MessangerChatService(null, this.getChat().page.token);
      const response = await chatService.sendVideo({ senderId, url: videoUrl });
      
      console.log('Debug: Video sent successfully:', response);
      
      // Save the outgoing video message to database
      const messageId = dataGet(response, "message_id") || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.processOutgoingMessage({
        id: messageId,
        body: {
          text: caption || "",
          attchment_url: videoUrl,
          reaction: "",
          type: "video"
        },
        type: "video",
        chat: this.getChat()
      });
      
      // If there's a caption, send it as a separate text message WITH quick replies
      if (caption && caption.trim() !== '') {
        // Prepare quick replies for feedback button
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
      
      console.log(`Messenger video message sent via chatbot: ${chatbotName}`);
      return response;
      
    } catch (error) {
      console.error('Debug: Error sending video message:', error);
      throw error;
    }
  }

  extractMessageText(nodeData) {
    // Handle video message nodes
    const caption = nodeData.captions || nodeData.data?.state?.state?.msgContent?.video?.caption;
    console.log('Debug: [Video Node] captions:', nodeData.captions);
    console.log('Debug: [Video Node] nested caption:', nodeData.data?.state?.state?.msgContent?.video?.caption);
    console.log('Debug: Final extracted video caption:', caption);
    return caption;
  }
}

module.exports = MessengerVideoMessageHandler; 