

class WhatsappWebhookController {
    async handleWebhook(req, res, next) {
        try {
            const { uid } = req.params;
            const body = req.body;
            await this.inboxService.handleWebhook(uid, body);
            return formSuccess(res, {});
        } catch (err) {
            next(err);
        }
    }

    async verifyWebhook(req, res, next) {
        try {
            const { uid } = req.params;
            const varifiedChallenge = await this.inboxService.verifyWebhook(uid, mode, token, challenge);
            if (varifiedChallenge) {
                return formRawResponse(res, varifiedChallenge);
            } else {
                res.sendStatus(403);
            }
        } catch (err) {
            next(err);
        }
    }
}

module.exports = WhatsappWebhookController