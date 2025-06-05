const QuickReplyService = require("../services/QuickReplyService");
const { formSuccess } = require("../utils/response.utils");

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
           return formSuccess(res,{
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

            return formSuccess(res,{
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
            return formSuccess(res,{
                message: "Quick reply deleted successfully"
            })
        } catch (err) {
            next(err);
        }
    }
}