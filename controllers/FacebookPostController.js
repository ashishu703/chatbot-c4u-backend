const FacebookPostService = require("../services/FacebookPostService");
const { formSuccess } = require("../utils/response.utils");

class FacebookPostController {
  constructor() {
    this.postService = new FacebookPostService();
  }

  async fetchPostsForPage(req, res, next) {
    try {
      const { pageId } = req.params;
      const user = req.decode;

      this.postService.setUser(user);
      const result = await this.postService.fetchAndSavePostsForPage(pageId);

      return formSuccess(res, {
        message: "Posts and comments fetched successfully",
        result
      });
    } catch (error) {
      console.error('Error in fetchPostsForPage:', error);
      return res.status(500).send({
        success: false,
        message: "Failed to fetch posts and comments",
        error: error.message
      });
    }
  }

  async fetchAllPostsAndComments(req, res, next) {
    try {
      const user = req.decode;

      this.postService.setUser(user);
      const result = await this.postService.fetchAndSaveAllPostsAndComments(user.uid);

      return formSuccess(res, {
        message: "All posts and comments fetched successfully",
        result
      });
    } catch (error) {
      console.error('Error in fetchAllPostsAndComments:', error);
      return res.status(500).send({
        success: false,
        message: "Failed to fetch all posts and comments",
        error: error.message
      });
    }
  }

  async getPostsByPage(req, res, next) {
    try {
      const { pageId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const posts = await this.postService.getPostsByPage(pageId, parseInt(limit), parseInt(offset));

      return formSuccess(res, {
        message: "Posts fetched successfully",
        posts,
        total: posts.length,
        pageId
      });
    } catch (error) {
      console.error('Error in getPostsByPage:', error);
      return res.status(500).send({
        success: false,
        message: "Failed to fetch posts",
        error: error.message
      });
    }
  }

  async getCommentsByPost(req, res, next) {
    try {
      const { postId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const comments = await this.postService.getCommentsByPost(postId, parseInt(limit), parseInt(offset));

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
}

module.exports = FacebookPostController;
