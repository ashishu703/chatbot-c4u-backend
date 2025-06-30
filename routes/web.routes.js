const express = require("express");
const router = express.Router();
const ContactFormController = require("../controllers/ContactFormController");
const WebConfigController = require("../controllers/WebConfigController");
const ThemeController = require("../controllers/ThemeController");
const WaLinkController = require("../controllers/WaLinkController");
const adminMiddleware = require("../middlewares/admin.middleware");

const contactFormController = new ContactFormController();
const webConfigController = new WebConfigController();
const themeController = new ThemeController();
const waLinkController = new WaLinkController();


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
