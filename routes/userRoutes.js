const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userMiddleware = require("../middlewares/user");
const {checkPlan, checkNote, checkTags, checkContactLimit} = require("../middlewares/plan");
const AuthController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');
const metaController = require('../controllers/metaController');
const widgetController = require('../controllers/widgetController');
const user = require("../models/user");


const authController = new AuthController();

router.get('/verify', authController.verify);
router.post('/login_with_facebook', authController.loginWithFacebook.bind(authController));
router.post('/login_with_google', authController.loginWithGoogle.bind(authController));
router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/send_resovery', authController.sendRecovery.bind(authController));
router.get('/modify_password', userMiddleware, authController.modifyPassword.bind(authController));
router.get('/generate_api_keys', userMiddleware, authController.generateApiKeys.bind(authController));
router.post('/auto_agent_login', userMiddleware, authController.autoAgentLogin.bind(authController));

router.post('/return_media_url', userMiddleware, userController.returnMediaUrl);
router.get('/get_me', userMiddleware, userController.getMe);
router.post('/save_note', userMiddleware, checkPlan, checkNote, userController.saveNote);
router.post('/push_tag', userMiddleware, checkPlan, checkTags, userController.pushTag);
router.post('/del_tag', userMiddleware, userController.deleteTag);
router.post('/check_contact', userMiddleware, userController.checkContact);
router.post('/save_contact', userMiddleware, checkPlan, checkContactLimit, userController.saveContact);
router.post('/del_contact', userMiddleware, userController.deleteContact);
router.post('/update_profile', userMiddleware, userController.updateProfile);
router.get('/get_dashboard', userMiddleware, userController.getDashboard);
router.post('/add_task_for_agent', userMiddleware, userController.addTaskForAgent);
router.get('/get_my_agent_tasks', userMiddleware, userController.getMyAgentTasks);
router.post('/del_task_for_agent', userMiddleware, userController.deleteTaskForAgent);
router.post('/update_agent_profile', userMiddleware, userController.updateAgentProfile);
router.get('/fetch_profile', userMiddleware, userController.fetchProfile);

router.get('/get_payment_details', userMiddleware, paymentController.getPaymentDetails);
router.post('/create_stripe_session', userMiddleware, paymentController.createStripeSession);
router.post('/pay_with_rz', userMiddleware, paymentController.payWithRazorpay);
router.post('/pay_with_paypal', userMiddleware, paymentController.payWithPaypal);
router.get('/stripe_payment', paymentController.stripePayment);
router.post('/start_free_trial', userMiddleware, paymentController.startFreeTrial);
router.post('/get_plan_details', userMiddleware, paymentController.getPlanDetails);

router.post('/update_meta', userMiddleware, metaController.updateMeta);
router.get('/get_meta_keys', userMiddleware, metaController.getMetaKeys);
router.post('/add_meta_templet', userMiddleware, checkPlan, metaController.addMetaTemplet);
router.get('/get_my_meta_templets', userMiddleware, metaController.getMyMetaTemplets);
router.post('/del_meta_templet', userMiddleware, metaController.deleteMetaTemplet);
router.post('/return_media_url_meta', userMiddleware, metaController.returnMediaUrlMeta);

router.post('/add_widget', userMiddleware, widgetController.addWidget);
router.get('/get_my_widget', userMiddleware, widgetController.getMyWidget);
router.post('/del_widget', userMiddleware, widgetController.deleteWidget);
router.get('/widget', widgetController.getWidget);
module.exports = router;