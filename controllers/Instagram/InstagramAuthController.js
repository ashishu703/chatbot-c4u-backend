const FacebookException = require("../../exceptions/FacebookException");
const InstagramAuthService = require("../../services/Instagram/InstagramAuthService");
const InstagramController = require("./InstagramController");

module.exports = class InstagramAuthController extends InstagramController {
    async initiateUserAuth(req, res) {
        try {
            const { accessToken } = req.body

            const user = req.decode;

            const authService = new InstagramAuthService(user, accessToken);

            const longLiveToken = await authService.initiateUserAuth(user);

            if(!longLiveToken) throw new Error("Authentication Failed");

            const pageService = new MessangerPageService(user, accessToken)

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