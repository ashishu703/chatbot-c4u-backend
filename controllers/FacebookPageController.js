const FacebookPageRepository = require("../repositories/FacebookPageRepository");
const MessangerPageService = require("../services/MessangerPageService");
const { formSuccess } = require("../utils/response.utils");
const MessangerController = require("./MessangerController");

module.exports = class FacebookPageController extends MessangerController {
  pageService;
  constructor() {
    super();
    this.pageService = new MessangerPageService();
  }

  async getInactivePages(req, res) {
    const user = req.decode;
    const pages = await FacebookPageRepository.findInactiveByUserId(user.uid);
    return formSuccess(res,{ pages });
  }

  async getActivePages(req, res) {
    const user = req.decode;
    const pages = await FacebookPageRepository.findActiveByUserId(user.uid);
    return formSuccess(res,{ pages });
  }

  async activatePages(req, res) {
    const { pages } = req.body;

    await pages.forEach(async (page) => {
      await this.pageService.activatePage(page);
    });

    return formSuccess(res,{});
  }

  async deletePage(req, res) {
    const { id } = req.params;

    await this.pageService.removePage(id);

    return formSuccess(res,{});
  }

  async discardInactivePages(req, res) {
    const user = req.decode;
    await FacebookPageRepository.deleteInActiveByUserId(user.uid);
    return formSuccess(res,{});
  }
};
