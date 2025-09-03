const { FacebookComment, SocialAccount, FacebookPage } = require("../models");
const Repository = require("./Repository");

class FacebookCommentRepository extends Repository {
  constructor() {
    super(FacebookComment);
  }

  async findByCommentId(commentId) {
    return await this.model.findOne({
      where: { comment_id: commentId },
      include: [
        {
          model: SocialAccount,
          as: "socialAccount",
        },
        {
          model: FacebookPage,
          as: "facebookPage",
        },
      ],
    });
  }

  async findByPostId(postId) {
    return await this.model.findAll({
      where: { post_id: postId },
      include: [
        {
          model: SocialAccount,
          as: "socialAccount",
        },
        {
          model: FacebookPage,
          as: "facebookPage",
        },
      ],
      order: [["created_time", "DESC"]],
    });
  }

  async findByPageId(pageId, limit = 50, offset = 0) {
    return await this.model.findAll({
      where: { page_id: pageId },
      order: [["created_time", "DESC"]],
      limit,
      offset,
    });
  }

  async findBySocialAccountId(socialAccountId, limit = 50, offset = 0) {
    return await this.model.findAll({
      where: { social_account_id: socialAccountId },
      order: [["created_time", "DESC"]],
      limit,
      offset,
    });
  }

  async createComment(commentData) {
    return await this.model.create(commentData);
  }

  async updateCommentStatus(commentId, status) {
    return await this.model.update(
      { status },
      { where: { comment_id: commentId } }
    );
  }

  async getCommentsCount(pageId) {
    return await this.model.count({
      where: { page_id: pageId, status: "active" },
    });
  }
}

module.exports = FacebookCommentRepository;
