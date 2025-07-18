const express = require("express");
const router = express.Router();
const validateUser = require("../middlewares/user.middleware");
const adminValidator = require("../middlewares/admin.middleware");
const AdminController = require("../controllers/AdminController");
const PlanController = require("../controllers/PlanController");
const UserController = require("../controllers/UserController");
const PageController = require("../controllers/PageController");
const TestimonialController = require("../controllers/TestimonialController");
const SmtpController = require("../controllers/SmtpController");
const SocialController = require("../controllers/SocialController");
const LinkController = require("../controllers/LinkController");
const AuthController = require("../controllers/AuthController");
const WhatsappMediaController = require("../controllers/WhatsappMediaController");
const ChatWidgetController = require("../controllers/ChatWidgetController");
const MediaController = require("../controllers/MediaController");
const ChatController = require("../controllers/ChatController");
const SmiController = require("../controllers/SmiController");
const PaymentController = require("../controllers/PaymentController");

const authController = new AuthController();
const adminController = new AdminController();
const planController = new PlanController();
const testimonialController = new TestimonialController();
const userController = new UserController();
const pageController = new PageController();
const smtpController = new SmtpController();
const socialController = new SocialController();
const linkController = new LinkController();
const chatWidgetController = new ChatWidgetController();
const mediaController = new MediaController();
const whatsappMediaController = new WhatsappMediaController();
const smiController = new SmiController();
const paymentController = new PaymentController();

router.get("/verify", authController.verify.bind(authController));
router.post("/signup", authController.signup.bind(authController));
router.post("/login", authController.userlogin.bind(authController));
router.post(
  "/login_with_google",
  authController.loginWithGoogle.bind(authController)
);
router.post("/send_resovery", authController.sendRecovery.bind(authController));
router.get(
  "/modify_password",
  adminValidator,
  adminController.modifyPassword.bind(adminController)
);
router.post(
  "/add_plan",
  adminValidator,
  planController.addPlan.bind(planController)
);
router.get("/get_plans", planController.getPlans.bind(planController));
router.post(
  "/del_plan",
  adminValidator,
  planController.deletePlan.bind(planController)
);
router.post(
  "/update_plan",
  adminValidator,
  planController.updatePlan.bind(planController)
);

router.get(
  "/get_users",
  adminValidator,
  userController.getUsers.bind(userController)
);
router.post(
  "/update_user",
  adminValidator,
  userController.updateUser.bind(userController)
);

router.post(
  "/update_profile",
  validateUser,
  userController.updateProfile.bind(userController)
);
router.post(
  "/del_user",
  adminValidator,
  userController.deleteUser.bind(userController)
);
router.post(
  "/auto_login",
  adminValidator,
  userController.autoLogin.bind(userController)
);

router.post(
  "/return_media_url",
  validateUser,
  mediaController.returnMediaUrl.bind(mediaController)
);

router.post(
  "/add_page",
  adminValidator,
  pageController.addPage.bind(pageController)
);
router.get("/get_pages", pageController.getPages.bind(pageController));
router.post(
  "/del_page",
  adminValidator,
  pageController.deletePage.bind(pageController)
);
router.post(
  "/get_page_slug",
  pageController.getPageBySlug.bind(pageController)
);
router.post(
  "/update_terms",
  adminValidator,
  pageController.updateTerms.bind(pageController)
);
router.post(
  "/update_privacy_policy",
  adminValidator,
  pageController.updatePrivacyPolicy.bind(pageController)
);

router.post(
  "/add_testimonial",
  adminValidator,
  testimonialController.addTestimonial.bind(testimonialController)
);
router.get(
  "/get_testi",
  testimonialController.getTestimonials.bind(testimonialController)
);
router.post(
  "/del_testi",
  adminValidator,
  testimonialController.deleteTestimonial.bind(testimonialController)
);

router.post(
  "/add_task_for_agent",
  validateUser,
  userController.addTaskForAgent.bind(userController)
);
router.get(
  "/get_my_agent_tasks",
  validateUser,
  userController.getMyAgentTasks.bind(userController)
);
router.post(
  "/del_task_for_agent",
  validateUser,
  userController.deleteAgentTask.bind(userController)
);

router.post(
  "/add_widget",
  validateUser,
  chatWidgetController.addWidget.bind(chatWidgetController)
);
router.get(
  "/get_my_widget",
  validateUser,
  chatWidgetController.getMyWidgets.bind(chatWidgetController)
);
router.post(
  "/del_widget",
  validateUser,
  chatWidgetController.deleteWidget.bind(chatWidgetController)
);

router.get(
  "/get_smtp",
  adminValidator,
  smtpController.getSmtp.bind(smtpController)
);
router.post(
  "/update_smtp",
  adminValidator,
  smtpController.updateSmtp.bind(smtpController)
);
router.post(
  "/send_test_email",
  adminValidator,
  smtpController.sendTestEmail.bind(smtpController)
);

router.get(
  "/get_dashboard",
  validateUser,
  userController.getDashboard.bind(userController)
);

router.get(
  "/get_wa_gen",
  adminValidator,
  linkController.getGeneratedLinks.bind(linkController)
);
router.post(
  "/de_wa_den_link",
  adminValidator,
  linkController.deleteGeneratedLink.bind(linkController)
);

router.get(
  "/get_web_public",
  socialController.getWebPublic.bind(socialController)
);
router.get(
  "/get_social_login",
  socialController.getSocialLogin.bind(socialController)
);
router.post(
  "/update_social_login",
  adminValidator,
  socialController.updateSocialLogin.bind(socialController)
);
router.post(
  "/update_rtl",
  adminValidator,
  socialController.updateRtl.bind(socialController)
);

router.post(
  "/return_media_url_meta",
  validateUser,
  whatsappMediaController.returnMediaUrlMeta.bind(whatsappMediaController)
);
router.get(
  "/get_auth_params",
  validateUser,
  smiController.getAuthParams.bind(smiController)
);
router.post(
  "/auto_agent_login",
  validateUser,
  userController.autoAgentLogin.bind(userController)
);

router.get(
  "/get_me",
  validateUser,
  userController.getUser.bind(userController)
);

router.post(
  "/get_plan_details",
  userController.getPlanDetails.bind(userController)
);

router.get(
  "/get_payment_details",
  validateUser,
  paymentController.getPaymentDetails.bind(paymentController)
);

router.post(
  "/create_stripe_session",
  validateUser,
  paymentController.createStripeSession.bind(paymentController)
);

router.get(
  "/stripe_payment",
  paymentController.stripePayment.bind(paymentController)
);

router.post(
  "/pay_with_paypal",
  validateUser,
  paymentController.payWithPaypal.bind(paymentController)
);
module.exports = router;
