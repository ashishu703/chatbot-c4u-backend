const FacebookCommentService = require("../services/FacebookCommentService");
const { formSuccess } = require("../utils/response.utils");

class FacebookCommentController {
  constructor() {
    this.commentService = new FacebookCommentService();
  }

  async getCommentsByPage(req, res) {
    try {
      const { pageId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const comments = await this.commentService.getCommentsByPage(
        parseInt(pageId),
        parseInt(limit),
        parseInt(offset)
      );
      
      return formSuccess(res, {
        message: "Comments fetched successfully",
        comments,
        total: comments.length,
        pageId: parseInt(pageId),
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error in getCommentsByPage:', error);
      return res.status(500).send({
        success: false,
        message: "Failed to fetch comments",
        error: error.message
      });
    }
  }

  async getCommentsByPost(req, res) {
    try {
      const { postId } = req.params;
      
      const comments = await this.commentService.getCommentsByPost(postId);
      
      return formSuccess(res, {
        message: "Comments fetched successfully",
        comments,
        total: comments.length,
        postId
      });
    } catch (error) {
      console.error('Error in getCommentsByPost:', error);
      return res.status(500).send({
        success: false,
        message: "Failed to fetch comments",
        error: error.message
      });
    }
  }

  async getCommentsBySocialAccount(req, res) {
    try {
      const { socialAccountId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const comments = await this.commentService.getCommentsBySocialAccount(
        parseInt(socialAccountId),
        parseInt(limit),
        parseInt(offset)
      );
      
      return formSuccess(res, {
        message: "Comments fetched successfully",
        comments,
        total: comments.length,
        socialAccountId: parseInt(socialAccountId),
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      console.error('Error in getCommentsBySocialAccount:', error);
      return res.status(500).send({
        success: false,
        message: "Failed to fetch comments",
        error: error.message
      });
    }
  }

  async updateCommentStatus(req, res) {
    try {
      const { commentId } = req.params;
      const { status } = req.body;
      
      if (!['active', 'hidden', 'deleted'].includes(status)) {
        return res.status(400).send({
          success: false,
          message: "Invalid status value",
          allowedStatuses: ['active', 'hidden', 'deleted']
        });
      }
      
      const result = await this.commentService.updateCommentStatus(commentId, status);
      
      return formSuccess(res, {
        message: "Comment status updated successfully",
        commentId,
        status,
        updated: result[0] > 0
      });
    } catch (error) {
      console.error('Error in updateCommentStatus:', error);
      return res.status(500).send({
        success: false,
        message: "Failed to update comment status",
        error: error.message
      });
    }
  }

  async getCommentsCount(req, res) {
    try {
      const { pageId } = req.params;
      
      const count = await this.commentService.getCommentsCount(parseInt(pageId));
      
      return formSuccess(res, {
        message: "Comments count fetched successfully",
        pageId: parseInt(pageId),
        count
      });
    } catch (error) {
      console.error('Error in getCommentsCount:', error);
      return res.status(500).send({
        success: false,
        message: "Failed to fetch comments count",
        error: error.message
      });
    }
  }
}

module.exports = FacebookCommentController;
