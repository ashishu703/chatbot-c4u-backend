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
};

module.exports = FacebookPageController
