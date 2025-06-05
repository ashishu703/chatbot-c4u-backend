const express = require("express");
const router = express.Router();
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
const linkController = new LinkController();
const socialController = new SocialController();

router.post("/login", adminController.initAdminLogin.bind(adminController));
router.post(
  "/send_resovery",
  adminController.sendRecovery.bind(adminController)
);
router.get(
  "/modify_password",
  adminValidator,
  adminController.modifyPassword.bind(adminController)
);
router.get(
  "/get_admin",
  adminValidator,
  adminController.getAdmin.bind(adminController)
);
router.post(
  "/update-admin",
  adminValidator,
  adminController.updateAdmin.bind(adminController)
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

router.get(
  "/get_payment_gateway_admin",
  adminValidator,
  paymentController.getPaymentGateway.bind(paymentController)
);
router.post(
  "/update_pay_gateway",
  adminValidator,
  paymentController.updatePaymentGateway.bind(paymentController)
);

router.post(
  "/add_brand_image",
  adminValidator,
  brandController.addBrandImage.bind(brandController)
);
router.get("/get_brands", brandController.getBrands.bind(brandController));
router.post(
  "/del_brand_logo",
  adminValidator,
  brandController.deleteBrandLogo.bind(brandController)
);

router.post(
  "/add_faq",
  adminValidator,
  faqController.addFaq.bind(faqController)
);
router.get("/get_faq", faqController.getFaqs.bind(faqController));
router.post(
  "/del_faq",
  adminValidator,
  faqController.deleteFaq.bind(faqController)
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

router.get(
  "/get_orders",
  adminValidator,
  orderController.getOrders.bind(orderController)
);

router.get(
  "/get_contact_leads",
  adminValidator,
  contactController.getContactLeads.bind(contactController)
);
router.post(
  "/del_cotact_entry",
  adminValidator,
  contactController.deleteContactEntry.bind(contactController)
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
  "/dashboard",
  adminValidator,
  dashboardController.getAdminDashboard.bind(dashboardController)
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

module.exports = router;
