const CommentAutomationSettingRepository = require("../repositories/CommentAutomationSettingRepository");
const MessangerChatService = require("./MessangerChatService");
const FacebookPageRepository = require("../repositories/FacebookPageRepository");

class FacebookCommentAutomationService {
  constructor() {
    this.commentSettingsRepository = new CommentAutomationSettingRepository();
    this.pageRepository = new FacebookPageRepository();
  }

  async processComment(webhookPayload) {
    try {
      const { entry } = webhookPayload;
      if (!entry?.length) return { success: false, error: 'Invalid payload' };

      await this.processEntries(entry);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async processEntries(entry) {
    for (const entryObj of entry) {
      const changes = entryObj.changes?.filter(change => change.field === 'feed' && change.value);
      for (const change of changes) {
        await this.handleNewComment(change.value, entryObj.id);
      }
    }
  }

  async handleNewComment(commentValue, pageId) {
    try {
      const { from, message, comment_id } = commentValue;
      
      const validation = await this.validateComment(from, message, pageId);
      if (!validation.valid) return { success: false, error: validation.error };

      const replies = await this.sendReplies(from.id, comment_id, message, validation.settings, validation.page.token);
      
      return { 
        success: replies.private || replies.public, 
        privateReplySent: replies.private, 
        publicReplySent: replies.public,
        commentId: comment_id,
        userId: from.id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async validateComment(from, message, pageId) {
    const basicValidation = this.validateBasicData(from, message);
    if (!basicValidation.valid) return basicValidation;

    const page = await this.pageRepository.findFirstWithAccount({ where: { page_id: pageId } });
    if (!page) return { valid: false, error: 'Page not found' };
    if (from.id === pageId) return { valid: false, error: 'Own comment skipped' };

    const settings = await this.commentSettingsRepository.findActiveSettings(page.account.uid, 'facebook');
    if (!settings?.is_active) return { valid: false, error: 'No active settings' };
    if (!this.shouldReply(message, settings)) return { valid: false, error: 'Comment does not match criteria' };

    return { valid: true, page, settings };
  }

  validateBasicData(from, message) {
    if (!from?.id || !message) return { valid: false, error: 'Invalid comment data' };
    return { valid: true };
  }

  async sendReplies(userId, commentId, message, settings, token) {
    const replies = { private: false, public: false };

    if (settings.private_reply_type === 'text' && settings.private_reply_text) {
      replies.private = await this.sendPrivateReply(userId, settings.private_reply_text, token);
    }

    if (settings.public_reply_type === 'text' && settings.public_reply_texts?.length > 0) {
      replies.public = await this.sendPublicReply(commentId, settings.public_reply_texts, token);
    }

    return replies;
  }

  shouldReply(commentText, settings) {
    const { reply_to } = settings;
    if (reply_to === 'all') return true;
    if (reply_to === 'equal') return settings.equal_comments?.includes(commentText);
    if (reply_to === 'contain') return this.checkContains(commentText, settings.contain_comments);
    return false;
  }

  checkContains(commentText, patterns) {
    return patterns?.some(pattern => 
      commentText.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  async sendPrivateReply(userId, replyText, token) {
    try {
      const chatService = new MessangerChatService(null, token);
      await chatService.send({ text: replyText, senderId: userId });
      return true;
    } catch {
      return false;
    }
  }

  async sendPublicReply(commentId, replyTexts, token) {
    try {
      const replyText = this.getRandomReply(replyTexts);
      const response = await this.postComment(commentId, replyText, token);
      return response.ok && response.result.id;
    } catch {
      return false;
    }
  }

  getRandomReply(replyTexts) {
    return replyTexts[Math.floor(Math.random() * replyTexts.length)];
  }

  async postComment(commentId, replyText, token) {
    const response = await fetch(`https://graph.facebook.com/v18.0/${commentId}/comments?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: replyText })
    });
    const result = await response.json();
    return { ok: response.ok, result };
  }
}

module.exports = FacebookCommentAutomationService;