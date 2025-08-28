const WebPrivateRepository = require("../repositories/WebPrivateRepository");
const PaymentService = require("../services/PaymentService");
const { formSuccess } = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");
const { or } = require("sequelize");
class PaymentController {
  webPrivateRepository;
  paymentService;
  constructor() {
    this.webPrivateRepository = new WebPrivateRepository();
    this.paymentService = new PaymentService();
  }
  async getPaymentGateway(req, res, next) {
    try {
      const data = await this.webPrivateRepository.getWebPrivate();
      return formSuccess(res, { data: data || {} });
    } catch (err) {
      next(err);
    }
  }

  async updatePaymentGateway(req, res, next) {
    try {
      const gatewayData = req.body;
      await this.webPrivateRepository.updateWebPrivate(gatewayData);
      return formSuccess(res, { msg: __t("payment_gateway_updated") });
    } catch (err) {
      next(err);
    }
  }

  async getPlanDetails(req, res, next) {
    try {
      const { id } = req.body;
      const result = await this.paymentService.getPlanDetails(id);
      return formSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getPaymentDetails(req, res, next) {
    try {
      const data = await this.webPrivateRepository.getWebPrivateDetails();
      return formSuccess(res, { data });
    } catch (err) {
      next(err);
    }
  }

  async createStripeSession(req, res, next) {
    try {
      const result = await this.paymentService.createStripeSession(
        req.body,
        req.decode.uid
      );
      return formSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async payWithRazorpay(req, res, next) {
    try {
      const { rz_payment_id, plan, amount } = req.body;
      await this.paymentService.payWithRazorpay(req.decode.uid, {
        rz_payment_id,
        plan,
        amount,
      });
      return formSuccess(res, { msg: __t("payment_thank_you") });
    } catch (err) {
      next(err);
    }
  }

  async createRazorpayOrder(req, res, next) {
    try {
      const { planId, amount } = req.body;
      const result = await this.paymentService.createRazorpayOrder(planId, amount);
      return formSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async payWithPaypal(req, res, next) {
    try {
      const { orderID, plan } = req.body;
      await this.paymentService.payWithPaypal(req.decode.uid, {
        orderID,
        plan,
      });
      return formSuccess(res, { msg: __t("payment_thank_you") });
    } catch (err) {
      next(err);
    }
  }

async stripePayment(req, res) {
    const { order, plan } = req.query;

    try {
      const response = await this.paymentService.handleStripePayment(order, plan);
      res.send(response);
    } catch (error) {
      console.error('Stripe payment error:', error);
      res.status(400).send('Payment failed or invalid request.');
    }
  }


  async startFreeTrial(req, res, next) {
    try {
      const { planId } = req.body;
      await this.paymentService.startFreeTrial(req.decode.uid, planId);
      return formSuccess(res, { msg: __t("trial_plan_activated") });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PaymentController;
