const CommentAutomationSettingRepository = require("../repositories/CommentAutomationSettingRepository");
const InstagramChatService = require("./InstagramChatService");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");

class InstagramCommentAutomationService {
  constructor() {
    this.commentSettingsRepository = new CommentAutomationSettingRepository();
    this.socialAccountRepository = new SocialAccountRepository();
  }

  async processComment(commentData) {
    try {
      const { entry } = commentData;
      let processedCount = 0;
      let successCount = 0;
      
      for (const entryObj of entry) {
        if (entryObj.changes && entryObj.changes.length > 0) {
          for (const change of entryObj.changes) {
            if (change.field === 'comments' && change.value) {
              const result = await this.handleNewComment(change.value, entryObj.id);
              processedCount++;
              if (result && result.success) {
                successCount++;
              }
            }
          }
        }
      }
      const isSuccess = processedCount > 0 && successCount === processedCount;
      return { 
        success: isSuccess, 
        processedCount, 
        successCount 
      };
      
    } catch (error) {
      console.error('Instagram Comment Automation Error:', error);
    }
  }

  async handleNewComment(commentValue, pageId) {
    try {
      const { from, media, id: commentId, text: commentText, parent_id } = commentValue;
      
      if (!from || !from.id || !commentText) {
        console.log('Invalid comment data:', commentValue);
        return;
      }

      // PREVENT INFINITE LOOP: Don't reply to replies (comments with parent_id)
      if (parent_id) {
        console.log('Skipping reply comment to prevent infinite loop');
        return;
      }

      console.log('Processing new Instagram comment:', {
        commentId,
        commentText,
        userId: from.id,
        username: from.username,
        pageId
      });

      // Find the Instagram profile/account
      const instagramProfile = await this.socialAccountRepository.findFirst({
        where: { social_user_id: pageId }
      });

      if (!instagramProfile) {
        console.log('Instagram profile not found for pageId:', pageId);
        return;
      }

      // PREVENT INFINITE LOOP: Don't reply to our own comments
      if (from.id === pageId) {
        console.log('Skipping own comment to prevent infinite loop');
        return;
      }

      // Get comment automation settings for this user
      const settings = await this.commentSettingsRepository.findActiveSettings(
        instagramProfile.uid, 
        'instagram'
      );

      if (!settings || !settings.is_active) {
        console.log('No active comment automation settings found');
        return;
      }

      // Check if we should reply to this comment
      if (!this.shouldReplyToComment(commentText, settings)) {
        console.log('Comment does not match reply criteria');
        return;
      }

      // Process private reply (send message to user) - only if user is not the bot
      if (settings.private_reply_type !== 'none' && from.id !== pageId) {
        await this.sendPrivateReply(from.id, settings, instagramProfile);
      }

      // Process public reply (reply to comment)
      if (settings.public_reply_type !== 'none') {
        await this.sendPublicReply(commentId, settings, instagramProfile);
      }

    } catch (error) {
      console.error('Error handling new comment:', error);
    }
  }

  shouldReplyToComment(commentText, settings) {
    if (settings.reply_to === 'all') {
      return true;
    }

    if (settings.reply_to === 'equal' && settings.equal_comments) {
      return settings.equal_comments.includes(commentText);
    }

    if (settings.reply_to === 'contain' && settings.contain_comments) {
      return settings.contain_comments.some(pattern => 
        commentText.toLowerCase().includes(pattern.toLowerCase())
      );
    }

    return false;
  }

  async sendPrivateReply(userId, settings, instagramProfile) {
    try {
      let replyText = '';

      if (settings.private_reply_type === 'text' && settings.private_reply_text) {
        replyText = settings.private_reply_text;
      } else if (settings.private_reply_type === 'flow' && settings.private_reply_flow_id) {
        // TODO: Implement flow execution
        console.log('Flow execution not implemented yet');
        return;
      }

      if (!replyText) {
        console.log('No private reply text available');
        return;
      }

      // Send the private message only - don't create chat or save to database
      const chatService = new InstagramChatService(null, instagramProfile.token);
      await chatService.send({
        text: replyText,
        senderId: userId
      });

      console.log('Private reply sent successfully to user:', userId);

    } catch (error) {
      console.error('Error sending private reply:', error);
    }
  }

  async sendPublicReply(commentId, settings, instagramProfile) {
    try {
      let replyText = '';

      if (settings.public_reply_type === 'text' && settings.public_reply_texts) {
        // Randomly select one of the reply texts
        const randomIndex = Math.floor(Math.random() * settings.public_reply_texts.length);
        replyText = settings.public_reply_texts[randomIndex];
      } else if (settings.public_reply_type === 'flow' && settings.public_reply_flow_id) {
        // TODO: Implement flow execution
        console.log('Flow execution not implemented yet');
        return;
      }

      if (!replyText) {
        console.log('No public reply text available');
        return;
      }

      // Send public reply to the comment using Instagram Graph API
      const response = await fetch(`https://graph.facebook.com/v22.0/${commentId}/replies?access_token=${instagramProfile.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `message=${encodeURIComponent(replyText)}`
      });

      const result = await response.json();

      if (response.ok && result.id) {
        console.log('Public reply sent successfully:', {
          commentId,
          replyId: result.id,
          replyText,
          profileId: instagramProfile.id
        });
      } else {
        console.error('Failed to send public reply:', result);
      }

    } catch (error) {
      console.error('Error sending public reply:', error);
    }
  }
}

module.exports = InstagramCommentAutomationService;


