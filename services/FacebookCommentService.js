const FacebookCommentRepository = require("../repositories/FacebookCommentRepository");
const FacebookPageRepository = require("../repositories/FacebookPageRepository");
const FacebookCommentAutomationService = require("./FacebookCommentAutomationService");

class FacebookCommentService {
  constructor() {
    this.commentRepository = new FacebookCommentRepository();
    this.pageRepository = new FacebookPageRepository();
    this.automationService = new FacebookCommentAutomationService();
  }



  async processCommentChange(commentData, pageId) {
    try {
      console.log("FacebookCommentService: Processing comment change with data:", {
        commentData,
        pageId
      });
      
      const { comment_id, post_id, from, message, created_time, verb } = commentData;
      
      if (!comment_id || !post_id || !from) {
        console.error("FacebookCommentService: Missing required comment data:", {
          comment_id,
          post_id,
          hasFrom: !!from,
          hasMessage: !!message
        });
        return;
      }

      if (verb && verb !== 'add') {
        console.log("FacebookCommentService: Skipping non-add comment event:", verb);
        return;
      }

      const commentText = message || '[No text content]';
      
      console.log("FacebookCommentService: Comment data validated:", {
        comment_id,
        post_id,
        from_id: from.id,
        from_name: from.name,
        message: commentText.substring(0, 100) + (commentText.length > 100 ? '...' : ''),
        created_time
      });
      
      const facebookPage = await this.pageRepository.findFirstWithAccount({
        where: { page_id: pageId }
      });

      if (!facebookPage) {
        console.log(`FacebookCommentService: Facebook page not found for page_id: ${pageId}`);
        return;
      }
      
      console.log("FacebookCommentService: Found Facebook page:", {
        pageId: facebookPage.id,
        pageName: facebookPage.name,
        accountId: facebookPage.account_id
      });

      console.log("FacebookCommentService: Comment processed successfully :", {
        comment_id,
        from_id: from.id,
        from_name: from.name,
        message: commentText.substring(0, 50) + '...'
      });

      try {
        const automationResult = await this.automationService.processComment(commentData, pageId);
        console.log("FacebookCommentService: Automation result:", automationResult);
      } catch (error) {
        console.error("FacebookCommentService: Automation error:", error);
      }
      
      return { processed: true, comment_id };
    } catch (error) {
      console.error('FacebookCommentService: Error processing comment change:', error);
      console.error('FacebookCommentService: Comment data that caused error:', commentData);
      throw error;
    }
  }

  async getCommentsByPage(pageId, limit = 50, offset = 0) {
    try {
      return await this.commentRepository.findByPageId(pageId, limit, offset);
    } catch (error) {
      console.error('Error fetching comments by page:', error);
      throw error;
    }
  }

  async getCommentsByPost(postId) {
    try {
      return await this.commentRepository.findByPostId(postId);
    } catch (error) {
      console.error('Error fetching comments by post:', error);
      throw error;
    }
  }

  async getCommentsBySocialAccount(socialAccountId, limit = 50, offset = 0) {
    try {
      return await this.commentRepository.findBySocialAccountId(socialAccountId, limit, offset);
    } catch (error) {
      console.error('Error fetching comments by social account:', error);
      throw error;
    }
  }

  async updateCommentStatus(commentId, status) {
    try {
      return await this.commentRepository.updateCommentStatus(commentId, status);
    } catch (error) {
      console.error('Error updating comment status:', error);
      throw error;
    }
  }

  async getCommentsCount(pageId) {
    try {
      return await this.commentRepository.getCommentsCount(pageId);
    } catch (error) {
      console.error('Error getting comments count:', error);
      throw error;
    }
  }
}

module.exports = FacebookCommentService;
