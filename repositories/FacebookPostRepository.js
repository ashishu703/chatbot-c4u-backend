const { FacebookPost, SocialAccount, FacebookPage } = require("../models");
const Repository = require("./Repository");

class FacebookPostRepository extends Repository {
  constructor() {
    super(FacebookPost);
  }

  async findByPostId(postId) {
    return await this.model.findOne({
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
    });
  }

  async findByPageId(pageId, limit = 100, offset = 0) {
    return await this.model.findAll({
      where: { page_id: pageId },
      order: [["created_time", "DESC"]],
      limit,
      offset,
    });
  }

  async findBySocialAccountId(socialAccountId, limit = 100, offset = 0) {
    return await this.model.findAll({
      where: { social_account_id: socialAccountId },
      order: [["created_time", "DESC"]],
      limit,
      offset,
    });
  }

  async createPost(postData) {
    return await this.model.create(postData);
  }

  async updatePostStatus(postId, status) {
    return await this.model.update(
      { status },
      { where: { post_id: postId } }
    );
  }

  async getPostsCount(pageId) {
    return await this.model.count({
      where: { page_id: pageId, status: "active" },
    });
  }

  async findOrCreatePost(postData) {
    const [post, created] = await this.model.findOrCreate({
      where: { post_id: postData.post_id },
      defaults: postData,
    });
    return { post, created };
  }
}

module.exports = FacebookPostRepository;
