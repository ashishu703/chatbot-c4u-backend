const express = require("express");
const router = express.Router();
const TranslationController = require("../controllers/TranslationController");
const ContactFormController = require("../controllers/ContactFormController");
const WebConfigController = require("../controllers/WebConfigController");
const ThemeController = require("../controllers/ThemeController");
const WaLinkController = require("../controllers/WaLinkController");
const adminMiddleware = require("../middlewares/admin.middleware");

const contactFormController = new ContactFormController();
const translationController = new TranslationController();
const webConfigController = new WebConfigController();
const themeController = new ThemeController();
const waLinkController = new WaLinkController();
// Translation routes
router.get(
  "/get-one-translation",
  translationController.getOneTranslation.bind(translationController)
);
router.get(
  "/get-all-translation-name",
  translationController.getAllTranslationNames.bind(translationController)
);
router.post(
  "/update-one-translation",
  adminMiddleware,
  translationController.updateTranslation.bind(translationController)
);
router.post(
  "/add-new-translation",
  adminMiddleware,
  translationController.addNewTranslation.bind(translationController)
);
router.post(
  "/del-one-translation",
  adminMiddleware,
  translationController.deleteTranslation.bind(translationController)
);

// Contact form
router.post(
  "/submit_contact_form",
  contactFormController.submitContactForm.bind(contactFormController)
);

// Web config
router.post(
  "/update_web_config",
  adminMiddleware,
  webConfigController.updateWebConfig.bind(webConfigController)
);
router.get(
  "/get_web_public",
  webConfigController.getWebPublic.bind(webConfigController)
);

// Theme
router.get("/get_theme", themeController.getTheme.bind(themeController));
router.post(
  "/save_theme",
  adminMiddleware,
  themeController.saveTheme.bind(themeController)
);

// WhatsApp link
router.post(
  "/gen_wa_link",
  waLinkController.generateWaLink.bind(waLinkController)
);

module.exports = router;
