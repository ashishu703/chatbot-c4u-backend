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
      // Get page information
      const page = await this.pageRepository.findByPageId(pageId);
      if (!page) {
        throw new Error(`Page not found: ${pageId}`);
      }

      // Initialize Meta API
      await this.messengerPageApi.initMeta();
      this.messengerPageApi.setToken(page.token);

      // Fetch posts from the page
      const { data: posts } = await this.messengerPageApi.fetchPosts(pageId, 100);
      
      let savedPosts = 0;
      let savedComments = 0;

      // Process each post
      for (const post of posts) {
        try {
          // Save post
          const postData = {
            post_id: post.id,
            page_id: page.id,
            message: post.message || null,
            story: post.story || null,
            created_time: new Date(post.created_time),
            updated_time: post.updated_time ? new Date(post.updated_time) : null,
            social_account_id: page.account_id,
            status: 'active'
          };

          const { post: savedPost, created: postCreated } = await this.postRepository.findOrCreatePost(postData);
          if (postCreated) {
            savedPosts++;
            console.log(`Post saved: ${post.id}`);
          }

          // Fetch and save comments for this post
          const commentsResult = await this.fetchAndSaveCommentsForPost(post.id, page, savedPost);
          savedComments += commentsResult;

        } catch (error) {
          console.error(`Error processing post ${post.id}:`, error);
        }
      }

      return {
        postsProcessed: posts.length,
        postsSaved: savedPosts,
        commentsSaved: savedComments
      };

    } catch (error) {
      console.error('Error fetching posts for page:', error);
      throw error;
    }
  }

  async fetchAndSaveCommentsForPost(postId, page, post) {
    try {
      // Fetch comments for the post
      const { data: comments } = await this.messengerPageApi.fetchComments(postId, 100);
      
      let savedComments = 0;

      // Process each comment
      for (const comment of comments) {
        try {
          const commentData = {
            comment_id: comment.id,
            post_id: postId,
            page_id: page.id,
            user_id: comment.from.id,
            user_name: comment.from.name,
            message: comment.message,
            created_time: new Date(comment.created_time * 1000),
            social_account_id: page.account_id,
            status: 'active'
          };

          // Check if comment already exists
          const existingComment = await this.commentRepository.findByCommentId(comment.id);
          if (!existingComment) {
            await this.commentRepository.createComment(commentData);
            savedComments++;
            console.log(`Comment saved: ${comment.id} for post: ${postId}`);
          }

        } catch (error) {
          console.error(`Error processing comment ${comment.id}:`, error);
        }
      }

      return savedComments;

    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      return 0;
    }
  }

  async fetchAndSaveAllPostsAndComments(userId) {
    try {
      // Get all active pages for the user
      const pages = await this.pageRepository.findActiveByUserId(userId);
      
      let totalPosts = 0;
      let totalComments = 0;

      for (const page of pages) {
        try {
          console.log(`Processing page: ${page.name} (${page.page_id})`);
          const result = await this.fetchAndSavePostsForPage(page.page_id);
          totalPosts += result.postsSaved;
          totalComments += result.commentsSaved;
        } catch (error) {
          console.error(`Error processing page ${page.page_id}:`, error);
        }
      }

      return {
        pagesProcessed: pages.length,
        totalPosts,
        totalComments
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
