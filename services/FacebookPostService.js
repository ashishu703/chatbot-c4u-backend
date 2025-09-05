const FacebookPostRepository = require("../repositories/FacebookPostRepository");
const FacebookCommentRepository = require("../repositories/FacebookCommentRepository");
const FacebookPageRepository = require("../repositories/FacebookPageRepository");
const MessengerPageApi = require("../api/Messanger/MessengerPageApi");

class FacebookPostService {
  constructor(user = null, accessToken = null) {
    this.user = user;
    this.postRepository = new FacebookPostRepository();
    this.commentRepository = new FacebookCommentRepository();
    this.pageRepository = new FacebookPageRepository();
    this.messengerPageApi = new MessengerPageApi(user, accessToken);
  }

  async fetchAndSavePostsForPage(pageId) {
    try {
      const page = await this.pageRepository.findByPageId(pageId);
      if (!page) {
        throw new Error(`Page not found: ${pageId}`);
      }

      await this.messengerPageApi.initMeta();
      this.messengerPageApi.setToken(page.token);

      const { data: posts } = await this.messengerPageApi.fetchPosts(pageId, 100);
      
      let processedPosts = 0;

      for (const post of posts) {
        try {
          console.log(`Post processed (no storage): ${post.id}`);
          processedPosts++;

        } catch (error) {
          console.error(`Error processing post ${post.id}:`, error);
        }
      }

      return {
        postsProcessed: posts.length,
        postsSaved: 0,
        commentsSaved: 0
      };

    } catch (error) {
      console.error('Error fetching posts for page:', error);
      throw error;
    }
  }

  async fetchAndSaveCommentsForPost(postId, page, post) {
    try {
      const { data: comments } = await this.messengerPageApi.fetchComments(postId, 100);
      
      let processedComments = 0;

      for (const comment of comments) {
        try {
          console.log(`Comment processed : ${comment.id} for post: ${postId}`);
          processedComments++;

        } catch (error) {
          console.error(`Error processing comment ${comment.id}:`, error);
        }
      }

      return processedComments;

    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      return 0;
    }
  }

  async fetchAndSaveAllPostsAndComments(userId) {
    try {
      const pages = await this.pageRepository.findActiveByUserId(userId);
      
      let totalProcessedPosts = 0;
      let totalProcessedComments = 0;

      for (const page of pages) {
        try {
          console.log(`Processing page: ${page.name} (${page.page_id})`);
          const result = await this.fetchAndSavePostsForPage(page.page_id);
          totalProcessedPosts += result.postsProcessed;
          totalProcessedComments += result.commentsSaved;
        } catch (error) {
          console.error(`Error processing page ${page.page_id}:`, error);
        }
      }

      return {
        pagesProcessed: pages.length,
        totalPosts: 0,
        totalComments: 0
      };

    } catch (error) {
      console.error('Error fetching all posts and comments:', error);
      throw error;
    }
  }

  async getPostsByPage(pageId, limit = 50, offset = 0) {
    try {
      const posts = await this.postRepository.findByPageId(pageId, limit, offset);
      return posts;
    } catch (error) {
      console.error('Error getting posts by page:', error);
      throw error;
    }
  }

  async getCommentsByPost(postId, limit = 50, offset = 0) {
    try {
      const comments = await this.commentRepository.findByPostId(postId, limit, offset);
      return comments;
    } catch (error) {
      console.error('Error getting comments by post:', error);
      throw error;
    }
  }
}

module.exports = FacebookPostService;
