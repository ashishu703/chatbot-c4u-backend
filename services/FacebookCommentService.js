const FacebookCommentRepository = require("../repositories/FacebookCommentRepository");
const FacebookPageRepository = require("../repositories/FacebookPageRepository");

class FacebookCommentService {
  constructor() {
    this.commentRepository = new FacebookCommentRepository();
    this.pageRepository = new FacebookPageRepository();
  }



  async processCommentChange(commentData, pageId) {
    try {
      console.log("FacebookCommentService: Processing comment change with data:", {
        commentData,
        pageId
      });
      
      const { comment_id, post_id, from, message, created_time } = commentData;
      
      // Validate required fields
      if (!comment_id || !post_id || !from || !message) {
        console.error("FacebookCommentService: Missing required comment data:", {
          comment_id,
          post_id,
          hasFrom: !!from,
          hasMessage: !!message
        });
        return;
      }
      
      console.log("FacebookCommentService: Comment data validated:", {
        comment_id,
        post_id,
        from_id: from.id,
        from_name: from.name,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        created_time
      });
      
      // Find the Facebook page
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

      // Check if comment already exists
      const existingComment = await this.commentRepository.findByCommentId(comment_id);
      if (existingComment) {
        console.log(`FacebookCommentService: Comment ${comment_id} already exists, skipping`);
        return;
      }

      // Create new comment
      const commentPayload = {
        comment_id,
        post_id,
        page_id: facebookPage.id,
        user_id: from.id,
        user_name: from.name,
        message,
        created_time: new Date(created_time * 1000),
        social_account_id: facebookPage.account_id,
        status: 'active'
      };

      console.log("FacebookCommentService: Creating comment with payload:", commentPayload);
      
      const savedComment = await this.commentRepository.createComment(commentPayload);
      console.log(`FacebookCommentService: Comment saved successfully:`, {
        comment_id,
        db_id: savedComment.id,
        message: savedComment.message?.substring(0, 50) + '...'
      });
      
      return savedComment;
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
