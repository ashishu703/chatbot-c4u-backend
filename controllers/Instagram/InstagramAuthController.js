const FacebookException = require("../../exceptions/FacebookException");
const InstagramAuthService = require("../../services/instagram/InstagramAuthService");
const InstagramProfileService = require("../../services/instagram/InstagramProfileService");
const InstagramController = require("./InstagramController");

module.exports = class InstagramAuthController extends InstagramController {
    async initiateUserAuth(req, res) {
        try {
            const { code } = req.body
            const user = req.decode;
            const authService = new InstagramAuthService(user, null);
            await authService.initMeta();
            await authService.initiateUserAuth(code);
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
            await authService.initMeta();
            const authURI = authService.prepareAuthUri();
            res.status(200).json({ msg: "success", authURI });
        } catch (error) {
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }


    async getAccounts(req, res) {
        try {
            const user = req.decode;
            const profileService = new InstagramProfileService(user, null);
            const profiles = await profileService.getProfiles();
            res.status(200).json({ msg: "success", profiles });
        }
        catch (err) {
            console.log(err);
            if (err instanceof FacebookException) {
                return res.status(400).json(err);
            }
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }



    async deleteAccount(req, res) {
        try {
            const { id } = req.params;
            const user = req.decode;
            const profileService = new InstagramProfileService(user, null);
            await profileService.deleteProfile(id);
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