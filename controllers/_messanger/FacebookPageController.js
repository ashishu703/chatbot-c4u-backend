const ChatRepository = require("../../repositories/chatRepository");
const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const MessangerPageService = require("../../services/_messanger/MessangerPageService");
const MessangerController = require("./MessangerController");

module.exports = class FacebookPageController extends MessangerController {
    pageService;
    constructor(
    ) {
        super();
        this.pageService = new MessangerPageService()
    }

    async getInactivePages(req, res) {
        const user = req.decode;
        const pages = await FacebookPageRepository.findInactiveByUserId(user.uid);
        res.json({ success: true, pages });
    }


    async getActivePages(req, res) {
        const user = req.decode;
        const pages = await FacebookPageRepository.findActiveByUserId(user.uid);
        res.json({ success: true, pages });
    }


    async activatePages(req, res) {
        const { pages } = req.body;

        await pages.forEach(async (page) => {
            await this.pageService.activatePage(page);
        });

        res.json({ success: true });
    }


    async deletePage(req, res) {
        const { id } = req.params;

        await this.pageService.removePage(id);

        res.json({ success: true });
    }

    async discardInactivePages(req, res) {
        const user = req.decode;
        await FacebookPageRepository.deleteInActiveByUserId(user.uid);
        res.json({ success: true });
    }
}