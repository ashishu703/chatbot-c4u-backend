const express = require("express");
const router = express.Router();
const adminValidator = require("../middlewares/admin");
const AdminController = require("../controllers/adminController");
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
const AuthController = require('../controllers/authController');

const authController = new AuthController();
const adminController = new AdminController();
const planController = new PlanController();
const contactController = new ContactController();
const testimonialController = new TestimonialController();
const userController = new UserController();

router.post('/login', authController.adminlogin.bind(authController));
router.post("/send_resovery", adminController.sendRecovery.bind(adminController));
router.get("/modify_password", adminValidator, adminController.modifyPassword.bind(adminController));
router.get("/get_admin", adminValidator, adminController.getAdmin.bind(adminController));
router.post("/update-admin", adminValidator, adminController.updateAdmin.bind(adminController));

router.post("/add_plan", adminValidator, planController.addPlan.bind(planController));
router.get("/get_plans", planController.getPlans.bind(planController));
router.post("/del_plan", adminValidator, planController.deletePlan.bind(planController));
router.post("/update_plan", adminValidator, planController.updatePlan.bind(planController));

router.get("/get_users", adminValidator, userController.getUsers.bind(userController));
router.post("/update_user", adminValidator, userController.updateUser.bind(userController));
router.post("/del_user", adminValidator, userController.deleteUser.bind(userController));
router.post("/auto_login", adminValidator, userController.autoLogin.bind(userController));

router.get("/get_payment_gateway_admin", adminValidator, PaymentController.getPaymentGateway);
router.post("/update_pay_gateway", adminValidator, PaymentController.updatePaymentGateway);

router.post("/add_brand_image", adminValidator, BrandController.addBrandImage);
router.get("/get_brands", BrandController.getBrands);
router.post("/del_brand_logo", adminValidator, BrandController.deleteBrandLogo);

router.post("/add_faq", adminValidator, FaqController.addFaq);
router.get("/get_faq", FaqController.getFaqs);
router.post("/del_faq", adminValidator, FaqController.deleteFaq);

router.post("/add_page", adminValidator, PageController.addPage);
router.get("/get_pages", PageController.getPages);
router.post("/del_page", adminValidator, PageController.deletePage);
router.post("/get_page_slug", PageController.getPageBySlug);
router.post("/update_terms", adminValidator, PageController.updateTerms);
router.post("/update_privacy_policy", adminValidator, PageController.updatePrivacyPolicy);

router.post("/add_testimonial", adminValidator, testimonialController.addTestimonial.bind(testimonialController));
router.get("/get_testi", testimonialController.getTestimonials.bind(testimonialController));
router.post("/del_testi", adminValidator, testimonialController.deleteTestimonial.bind(testimonialController));

router.get("/get_orders", adminValidator, OrderController.getOrders);

router.get("/get_contact_leads", adminValidator, contactController.getContactLeads.bind(contactController));
router.post("/del_cotact_entry", adminValidator, contactController.deleteContactEntry.bind(contactController));

router.get("/get_smtp", adminValidator, SmtpController.getSmtp);
router.post("/update_smtp", adminValidator, SmtpController.updateSmtp);
router.post("/send_test_email", adminValidator, SmtpController.sendTestEmail);

router.get("/dashboard", adminValidator, DashboardController.getAdminDashboard);

router.get("/get_wa_gen", adminValidator, LinkController.getGeneratedLinks);
router.post("/de_wa_den_link", adminValidator, LinkController.deleteGeneratedLink);

router.get("/get_web_public", SocialController.getWebPublic);
router.get("/get_social_login", SocialController.getSocialLogin);
router.post("/update_social_login", adminValidator, SocialController.updateSocialLogin);
router.post("/update_rtl", adminValidator, SocialController.updateRtl);

module.exports = router;