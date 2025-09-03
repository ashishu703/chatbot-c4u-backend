const { producer, consumer, topics } = require('../../config/kafka.config');

class InstagramCommentKafkaService {
  constructor() {
    this.isConnected = false;
  }

  // Add Instagram comment to Kafka queue
  async addCommentToQueue(commentData) {
    try {
      if (!this.isConnected) {
        throw new Error('Kafka not connected');
      }

      const message = {
        commentId: commentData.id,
        postId: commentData.postId,
        userId: commentData.userId,
        username: commentData.username,
        text: commentData.text,
        timestamp: Date.now()
      };

      await producer.send({
        topic: topics.INSTAGRAM_COMMENTS,
        messages: [{ value: JSON.stringify(message) }]
      });

      console.log('📤 [INSTAGRAM KAFKA] Comment added to queue:', commentData.id);
      return true;
    } catch (error) {
      console.error('❌ [INSTAGRAM KAFKA] Failed to add comment to queue:', error);
      throw error;
    }
  }

  // Start consuming comments and reply
  async startConsumingComments() {
    try {
      console.log('📥 [INSTAGRAM KAFKA] Starting comment consumption...');
      
      await consumer.subscribe({ topic: topics.INSTAGRAM_COMMENTS, fromBeginning: false });
      
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const commentData = JSON.parse(message.value.toString());
            console.log('📸 [INSTAGRAM KAFKA] Processing comment:', commentData.commentId);
            
            // Process the comment and send reply
            await this.processCommentAndReply(commentData);
            
          } catch (error) {
            console.error('❌ [INSTAGRAM KAFKA] Error processing comment:', error);
          }
        }
      });

      console.log('✅ [INSTAGRAM KAFKA] Comment consumption started');
    } catch (error) {
      console.error('❌ [INSTAGRAM KAFKA] Failed to start consumption:', error);
      throw error;
    }
  }

  // Process comment and send reply
  async processCommentAndReply(commentData) {
    try {
      console.log('💬 [INSTAGRAM KAFKA] Processing comment:', {
        commentId: commentData.commentId,
        username: commentData.username,
        text: commentData.text
      });

      // Here you can add your logic to generate reply
      const reply = await this.generateReply(commentData.text);
      
      // Send reply using your existing Instagram API
      await this.sendReply(commentData.commentId, reply);
      
      console.log('✅ [INSTAGRAM KAFKA] Reply sent for comment:', commentData.commentId);
    } catch (error) {
      console.error('❌ [INSTAGRAM KAFKA] Error processing comment:', error);
    }
  }

  // Generate reply based on comment text
  async generateReply(commentText) {
    // Simple reply logic - you can enhance this
    const replies = [
      "Thanks for your comment! 😊",
      "Great feedback! 👍",
      "Appreciate your thoughts! 🙏",
      "Thanks for engaging with us! 💙",
      "Love your comment! ❤️"
    ];
    
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // Send reply to Instagram comment
  async sendReply(commentId, replyText) {
    try {
      // Here you would integrate with your existing Instagram API
      // const instagramApi = new InstagramApi();
      // await instagramApi.replyToComment(commentId, replyText);
      
      console.log('📤 [INSTAGRAM KAFKA] Sending reply:', {
        commentId,
        reply: replyText
      });
      
      // For now, just log the reply
      console.log(`Reply to comment ${commentId}: ${replyText}`);
      
    } catch (error) {
      console.error('❌ [INSTAGRAM KAFKA] Error sending reply:', error);
      throw error;
    }
  }

  // Stop consuming
  async stop() {
    try {
      console.log('🛑 [INSTAGRAM KAFKA] Stopping...');
      await consumer.disconnect();
      await producer.disconnect();
      this.isConnected = false;
      console.log('✅ [INSTAGRAM KAFKA] Stopped successfully');
    } catch (error) {
      console.error('❌ [INSTAGRAM KAFKA] Error stopping:', error);
    }
  }
}

module.exports = InstagramCommentKafkaService;
