const FacebookException = require("../../exceptions/FacebookException");
const MessangerAuthService = require("../../services/Messanger/MessangerAuthService");
const MessangerPageService = require("../../services/Messanger/MessangerPageService");
const MessangerController = require("./MessangerController");

module.exports = class MessangerAuthController extends MessangerController {
    async initiateUserAuth(req, res) {
        try {
            const { accessToken } = req.body

            const user = req.decode;

            const authService = new MessangerAuthService(user, accessToken);

            const accountInfo = await authService.initiateUserAuth();

            if(!accountInfo) throw new Error("Authentication Failed");

            const pageService = new MessangerPageService(user, accountInfo.accessToken)

            await pageService.fetchAndSavePages(accountInfo.accountId);
            
            res.status(200).json({ msg: "success" });
        }
        catch (err) {
            console.log(err);
            if (err instanceof FacebookException) {
                return res.status(400).json(err);
            }
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }
}