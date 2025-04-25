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

router.post("/login", AdminController.login);
router.post("/send_resovery", AdminController.sendRecovery);
router.get("/modify_password", adminValidator, AdminController.modifyPassword);
router.get("/get_admin", adminValidator, AdminController.getAdmin);
router.post("/update-admin", adminValidator, AdminController.updateAdmin);

router.post("/add_plan", adminValidator, PlanController.addPlan);
router.get("/get_plans", PlanController.getPlans);
router.post("/del_plan", adminValidator, PlanController.deletePlan);
router.post("/update_plan", adminValidator, PlanController.updatePlan);

router.get("/get_users", adminValidator, UserController.getUsers);
router.post("/update_user", adminValidator, UserController.updateUser);
router.post("/del_user", adminValidator, UserController.deleteUser);
router.post("/auto_login", adminValidator, UserController.autoLogin);

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

router.post("/add_testimonial", adminValidator, TestimonialController.addTestimonial);
router.get("/get_testi", TestimonialController.getTestimonials);
router.post("/del_testi", adminValidator, TestimonialController.deleteTestimonial);

router.get("/get_orders", adminValidator, OrderController.getOrders);

router.get("/get_contact_leads", adminValidator, ContactController.getContactLeads);
router.post("/del_cotact_entry", adminValidator, ContactController.deleteContactEntry);

router.get("/get_smtp", adminValidator, SmtpController.getSmtp);
router.post("/update_smtp", adminValidator, SmtpController.updateSmtp);
router.post("/send_test_email", adminValidator, SmtpController.sendTestEmail);

router.get("/get_dashboard_for_user", adminValidator, DashboardController.getDashboard);

router.get("/get_wa_gen", adminValidator, LinkController.getGeneratedLinks);
router.post("/de_wa_den_link", adminValidator, LinkController.deleteGeneratedLink);

router.get("/get_web_public", SocialController.getWebPublic);
router.get("/get_social_login", SocialController.getSocialLogin);
router.post("/update_social_login", adminValidator, SocialController.updateSocialLogin);
router.post("/update_rtl", adminValidator, SocialController.updateRtl);

module.exports = router;