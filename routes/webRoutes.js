const express = require('express');
const router = express.Router();
const TranslationController = require('../controllers/TranslationController');
const ContactController = require('../controllers/ContactController');
const WebConfigController = require('../controllers/WebConfigController');
const AppController = require('../controllers/appController');
const ThemeController = require('../controllers/ThemeController');
const WaLinkController = require('../controllers/WaLinkController');
const adminMiddleware = require('../middlewares/admin');

const contactController = new ContactController();
const translationController = new TranslationController();
const webConfigController = new WebConfigController();
const appController = new AppController();
const themeController = new ThemeController();
const waLinkController = new WaLinkController();
// Translation routes
router.get('/return_module', appController.returnModule.bind(appController));
router.get('/get-one-translation', translationController.getOneTranslation.bind(translationController));
router.get('/get-all-translation-name', translationController.getAllTranslationNames.bind(translationController));
router.post('/update-one-translation', adminMiddleware, translationController.updateTranslation.bind(translationController));
router.post('/add-new-translation', adminMiddleware, translationController.addNewTranslation.bind(translationController));
router.post('/del-one-translation', adminMiddleware, translationController.deleteTranslation.bind(translationController));

// Contact form
router.post('/submit_contact_form', contactController.submitContactForm.bind(contactController));

// Web config
router.post('/update_web_config', adminMiddleware, webConfigController.updateWebConfig.bind(webConfigController));
router.get('/get_web_public', webConfigController.getWebPublic.bind(webConfigController));

// App install/update
router.get('/check_install', appController.checkInstall.bind(appController));
router.get('/get_app_version', appController.getAppVersion.bind(appController));
router.post('/install_app', appController.installApp.bind(appController));
router.post('/update_app', appController.updateApp.bind(appController));
router.get('/update_to_be_shown', appController.updateToBeShown.bind(appController));

// Theme
router.get('/get_theme', themeController.getTheme.bind(themeController));
router.post('/save_theme', adminMiddleware, themeController.saveTheme.bind(themeController));

// WhatsApp link
router.post('/gen_wa_link', waLinkController.generateWaLink.bind(waLinkController));

module.exports = router;