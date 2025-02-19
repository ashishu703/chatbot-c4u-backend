const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const MessangerController = require("./MessangerController");

module.exports = class FacebookPageController extends MessangerController {
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
        const {pages} =  req.body;
        const user = req.decode;
        await FacebookPageRepository.activatePagesByUserId(user.uid, pages);
        await FacebookPageRepository.deleteInActiveByUserId(user.uid);
        res.json({ success: true });
    }


    async deletePage(req, res) {
        const { id } = req.params;
        const user = req.decode;
        await FacebookPageRepository.deleteByPageId(id);
        res.json({ success: true });
    }   
}