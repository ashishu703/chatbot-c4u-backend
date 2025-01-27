const FacebookException = require("../../exceptions/FacebookException");
const FacebookAuthService = require("../../services/Facebook/FacebookAuthService");
const FacebookPageService = require("../../services/Facebook/FacebookPageService");
const FacebookController = require("./FacebookController");

module.exports = class FacebookAuthController extends FacebookController {
    async initiateUserAuth(req, res) {
        try {
            const { accessToken } = req.body

            const user = req.decode;

            const authService = new FacebookAuthService(user, accessToken);

            const longLiveToken = await authService.initiateUserAuth(user);

            if(!longLiveToken) throw new Error("Authentication Failed");

            const pageService = new FacebookPageService(user, accessToken)

            await pageService.fetchAndSavePages();
            
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