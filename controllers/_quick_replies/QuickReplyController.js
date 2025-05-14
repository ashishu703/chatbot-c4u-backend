const QuickReplyService = require("../../services/QuickReplyService")

module.exports = class QuickReplyController {
    quickReplyService;
    constructor(
    ) {
        this.quickReplyService = new QuickReplyService()
    }


    async createQuickReplies(req, res, next) {

        try {
            const uid = req.decode.uid;
            const message = req.body.message;
            await this.quickReplyService.create({ uid, message });
            return res.send({
                success: true,
                message: "Quick reply created successfully"
            })
        } catch (err) {
            next(err);
        }
    }

    async getQuickReplies(req, res, next) {

        try {
            const uid = req.decode.uid;

            const quickReplies = await this.quickReplyService.list(uid);

            return res.send({
                success: true,
                quickReplies
            })
        } catch (err) {
            next(err);
        }
    }

    async deleteQuickReplies(req, res, next) {
        try {
            const id = req.params.id;
            await this.quickReplyService.destroy(id);
            return res.send({
                success: true,
                message: "Quick reply deleted successfully"
            })
        } catch (err) {
            next(err);
        }
    }
}