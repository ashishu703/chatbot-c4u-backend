const router = require("express").Router();
const validateUser = require("../middlewares/user.js");
const AuthController = require("../controllers/_whatsapp/WhatsappAuthController.js");
const authController = new AuthController();

router.get("/auth-params", validateUser, authController.getAuthParams.bind(authController));

router.post("/auth-init", validateUser, authController.initiateUserAuth.bind(authController));

router.get('/accounts', validateUser, authController.getAccounts.bind(authController));

router.delete('/accounts/:id', validateUser, authController.deleteAccount.bind(authController));

module.exports = router;
