const FacebookPageRepository = require("../repositories/FacebookPageRepository");
const MessangerPageService = require("../services/MessangerPageService");
const { formSuccess } = require("../utils/response.utils");

class FacebookPageController {
  pageService;
  constructor() {
    this.pageService = new MessangerPageService();
    this.pageRepository = new FacebookPageRepository();
  }

  async getInactivePages(req, res) {
    const user = req.decode;
    const pages = await this.pageRepository.findInactiveByUserId(user.uid);
    return formSuccess(res, { pages });
  }

  async getActivePages(req, res) {
    const user = req.decode;
    const pages = await this.pageRepository.findActiveByUserId(user.uid);
    return formSuccess(res, { pages });
  }

  async activatePages(req, res) {
    const { pages } = req.body;

    await pages.forEach(async (page) => {
      await this.pageService.activatePage(page);
    });

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
