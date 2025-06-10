const router = require("express").Router();
const validateUser = require("../middlewares/user.middleware.js");
const AuthController = require("../controllers/WhatsappAuthController.js");
const WhatsappWebhookController = require("../controllers/WhatsappWebhookController.js");
const authController = new AuthController();
const whatsappWebhookController = new WhatsappWebhookController();

router.get(
  "/webhook",
  whatsappWebhookController.verifyWebhook.bind(whatsappWebhookController)
);


router.post(
  "/auth-init",
  validateUser,
  authController.initiateUserAuth.bind(authController)
);

router.get(
  "/accounts",
  validateUser,
  authController.getAccounts.bind(authController)
);

router.delete(
  "/accounts/:wabaId",
  validateUser,
  authController.deleteAccount.bind(authController)
);

module.exports = router;
