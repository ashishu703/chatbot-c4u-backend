const router = require("express").Router();
const validateUser = require("../middlewares/user.middleware.js");
const AuthController = require("../controllers/WhatsappAuthController.js");
const WhatsappWebhookController = require("../controllers/WhatsappWebhookController.js");
const WhatsappChatController = require("../controllers/WhatsappChatController.js");
const WhatsappTemplateController = require("../controllers/WhatsappTemplateController.js");
const authController = new AuthController();
const whatsappWebhookController = new WhatsappWebhookController();
const whatsappChatController = new WhatsappChatController();
const whatsappTemplateController = new WhatsappTemplateController();


router.post(
  "/auth-init",
  validateUser,
  authController.initiateUserAuth.bind(authController)
);

// Debug health endpoint for connectivity checks
router.get(
  "/health",
  (req, res) => res.json({ ok: true, ts: Date.now() })
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


router.get(
  "/webhook",
  whatsappWebhookController.verifyWebhook.bind(whatsappWebhookController)
);

router.post(
  "/webhook",
  whatsappWebhookController.handleWebhook.bind(whatsappWebhookController)
);

// router.post(
//   "/send_templet",
//   validateUser,
//   // checkPlan,
//   whatsappChatController.sendTemplate.bind(whatsappChatController)
// );

router.post(
  "/send_image",
  validateUser,
  // checkPlan,
  whatsappChatController.sendImage.bind(whatsappChatController)
);

router.post(
  "/send_video",
  validateUser,
  // checkPlan,
  whatsappChatController.sendVideo.bind(whatsappChatController)
);

router.post(
  "/send_doc",
  validateUser,
  // checkPlan,
  whatsappChatController.sendDocument.bind(whatsappChatController)
);

router.post(
  "/send_audio",
  validateUser,
  // checkPlan,
  whatsappChatController.sendAudio.bind(whatsappChatController)
);

router.post(
  "/send_text",
  validateUser,
  // checkPlan,
  whatsappChatController.sendText.bind(whatsappChatController)
);
// router.post(
//   "/send_meta_templet",
//   validateUser,
//   // checkPlan,
//   whatsappChatController.sendMetaTemplate.bind(whatsappChatController)
// );

router.post(
  "/add_meta_templet",
  validateUser,
  // checkPlan,
  whatsappTemplateController.addTemplate.bind(whatsappTemplateController)
);
router.get(
  "/get_my_meta_templets",
  validateUser,
  whatsappTemplateController.getTemplates.bind(whatsappTemplateController)
);
router.post(
  "/del_meta_templet",
  validateUser,
  whatsappTemplateController.deleteTemplates.bind(whatsappTemplateController)
);





module.exports = router;
