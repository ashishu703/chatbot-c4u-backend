const express = require("express");
const router = express.Router();
const validateUser = require("../middlewares/user.middleware");
const { checkPlan, checkNote, checkTags } = require("../middlewares/plan.middleware");
const adminValidator = require("../middlewares/admin.middleware");
const AdminController = require("../controllers/AdminController");
const PlanController = require("../controllers/planController");
const UserController = require("../controllers/userController");
const PaymentController = require("../controllers/paymentController");
const BrandController = require("../controllers/brandController");
const FaqController = require("../controllers/faqController");
const PageController = require("../controllers/pageController");
const TestimonialController = require("../controllers/testimonialController");
const OrderController = require("../controllers/orderController");
const ContactController = require("../controllers/contactController");
const SmtpController = require("../controllers/smtpController");
const DashboardController = require("../controllers/dashboardController");
const SocialController = require("../controllers/socialController");
const LinkController = require("../controllers/linkController");
const AuthController = require("../controllers/authController");
const MetaController = require("../controllers/metaController");
const ChatWidgetController = require("../controllers/chatWidgetController");
const MediaController = require("../controllers/mediaController");
const ChatController = require("../controllers/chatController");

const authController = new AuthController();
const adminController = new AdminController();
const planController = new PlanController();
const contactController = new ContactController();
const testimonialController = new TestimonialController();
const userController = new UserController();
const pageController = new PageController();
const orderController = new OrderController();
const paymentController = new PaymentController();
const brandController = new BrandController();
const faqController = new FaqController();
const smtpController = new SmtpController();
const dashboardController = new DashboardController();
const socialController = new SocialController();
const linkController = new LinkController();
const chatWidgetController = new ChatWidgetController();
const mediaController = new MediaController();
const chatController = new ChatController();
const metaController = new MetaController();

router.get("/verify", authController.verify.bind(authController));
router.post("/signup", authController.signup.bind(authController));
router.post("/login", authController.userlogin.bind(authController));
router.post(
  "/login_with_google",
  authController.loginWithGoogle.bind(authController)
);
router.post(
  "/send_resovery",
  authController.sendRecovery.bind(authController)
);
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

router.post(
  "/save_note",
  validateUser,
  checkPlan,
  checkNote,
  chatController.saveNote.bind(chatController)
);
router.post(
  "/push_tag",
  validateUser,
  checkPlan,
  checkTags,
  chatController.pushTag.bind(chatController)
);
router.post(
  "/del_tag",
  validateUser,
  chatController.deleteTag.bind(chatController)
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
  "/update_meta",
  validateUser,
  metaController.updateMetaApi.bind(metaController)
);
router.get(
  "/get_meta_keys",
  validateUser,
  metaController.getMetaKeys.bind(metaController)
);
router.post(
  "/add_meta_templet",
  validateUser,
  checkPlan,
  metaController.addMetaTemplet.bind(metaController)
);
router.get(
  "/get_my_meta_templets",
  validateUser,
  metaController.getMyMetaTemplets.bind(metaController)
);
router.post(
  "/del_meta_templet",
  validateUser,
  metaController.deleteMetaTemplet.bind(metaController)
);
router.post(
  "/return_media_url_meta",
  validateUser,
  metaController.returnMediaUrlMeta.bind(metaController)
);

module.exports = router;
