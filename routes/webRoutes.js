const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');
const ContactController = require('../controllers/contactController');
const webConfigController = require('../controllers/webConfigController');
const appController = require('../controllers/appController');
const themeController = require('../controllers/themeController');
const waLinkController = require('../controllers/waLinkController');
const adminMiddleware = require('../middlewares/admin');

const contactController = new ContactController();

// Translation routes
router.get('/return_module', appController.returnModule);
router.get('/get-one-translation', translationController.getOneTranslation);
router.get('/get-all-translation-name', translationController.getAllTranslationNames);
router.post('/update-one-translation', adminMiddleware, translationController.updateTranslation);
router.post('/add-new-translation', adminMiddleware, translationController.addNewTranslation);
router.post('/del-one-translation', adminMiddleware, translationController.deleteTranslation);

// Contact form
router.post('/submit_contact_form', contactController.submitContactForm.bind(contactController));

// Web config
router.post('/update_web_config', adminMiddleware, webConfigController.updateWebConfig);
router.get('/get_web_public', webConfigController.getWebPublic);

// App install/update
router.get('/check_install', appController.checkInstall);
router.get('/get_app_version', appController.getAppVersion);
router.post('/install_app', appController.installApp);
router.post('/update_app', appController.updateApp);
router.get('/update_to_be_shown', appController.updateToBeShown);

// Theme
router.get('/get_theme', themeController.getTheme);
router.post('/save_theme', adminMiddleware, themeController.saveTheme);

// WhatsApp link
router.post('/gen_wa_link', waLinkController.generateWaLink);

module.exports = router;