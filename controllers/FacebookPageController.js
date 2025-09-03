const FacebookPageRepository = require("../repositories/FacebookPageRepository");
const MessangerPageService = require("../services/MessangerPageService");
const { formSuccess } = require("../utils/response.utils");

class FacebookPageController {
  pageService;
  constructor() {
    this.pageService = new MessangerPageService();
    this.pageRepository = new FacebookPageRepository();
  }

  async getPages(req, res) {
    const user = req.decode;
    const pages = await this.pageRepository.find({
      where: { uid: user.uid }
    });

    return formSuccess(res, { pages });
  }

  async activatePages(req, res) {
    const { pages } = req.body;
    const user = req.decode;

    for await (const page of pages) {
      await this.pageService.activatePage(user.uid, page);
    };

    return formSuccess(res, {});
  }

  async deletePage(req, res) {
    const { id } = req.params;

    await this.pageService.removePage(id);

    return formSuccess(res, {});
  }

  async discardInactivePages(req, res) {
    const user = req.decode;
    await this.pageRepository.deleteInActiveByUserId(user.uid);
    return formSuccess(res, {});
  }

  async fetchPostsAndCommentsForPage(req, res) {
    try {
      const { pageId } = req.params;
      const user = req.decode;

      this.pageService.setUser(user);
      const result = await this.pageService.fetchPostsAndCommentsForPage(pageId);

      return formSuccess(res, {
        message: "Posts and comments fetched successfully",
        result
      });
    } catch (error) {
      console.error('Error in fetchPostsAndCommentsForPage:', error);
      return res.status(500).send({
        success: false,
        message: "Failed to fetch posts and comments",
        error: error.message
      });
    }
  }

  async fetchPostsAndCommentsForAllPages(req, res) {
    try {
      const user = req.decode;

      this.pageService.setUser(user);
      const result = await this.pageService.fetchPostsAndCommentsForAllPages(user.uid);

      return formSuccess(res, {
        message: "Posts and comments fetched for all pages successfully",
        result
      });
    } catch (error) {
      console.error('Error in fetchPostsAndCommentsForAllPages:', error);
      return res.status(500).send({
        success: false,
        message: "Failed to fetch posts and comments for all pages",
        error: error.message
      });
    }
  }
};

module.exports = FacebookPageController
