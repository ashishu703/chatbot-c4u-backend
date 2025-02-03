const FacebookException = require("../../exceptions/FacebookException");
const InstagramAuthService = require("../../services/Instagram/InstagramAuthService");
const InstagramProfileService = require("../../services/Instagram/InstagramProfileService");
const InstagramController = require("./InstagramController");

module.exports = class InstagramAuthController extends InstagramController {
    async initiateUserAuth(req, res) {
        try {
            const { code } = req.body

            const user = req.decode;

            const authService = new InstagramAuthService(user, null);

            const accessToken =  await authService.initiateUserAuth(code);

            const profileService = new InstagramProfileService(user, accessToken);

            await profileService.fetchAndSaveProfile()

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


    async getAuthUri(req, res) {
        try {
            const authService = new InstagramAuthService(null, null)

            const authURI = authService.prepareAuthUri();

            res.status(200).json({ msg: "success", authURI });

        } catch (error) {
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }
}