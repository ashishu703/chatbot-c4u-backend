const PaymentRepository = require("../repositories/paymentRepository");
const PaymentService = require("../services/PaymentService");
class PaymentController {
  paymentRepository;
  paymentService;
  constructor(){
    this.paymentRepository = new PaymentRepository();
    this.paymentService =new PaymentService();
  }
   async getPaymentGateway(req, res, next) {
    try {
      const data = await this.paymentRepository.getPaymentGateway();
      res.json({ data: data || {}, success: true });
    } catch (err) {
      next(err);
    }
  }

   async updatePaymentGateway(req, res, next) {
    try {
      const gatewayData = req.body;
      await this.paymentRepository.updatePaymentGateway(gatewayData);
      res.json({ success: true, msg: "Payment gateway updated" });
    } catch (err) {
      next(err);
    }
  }

  async getPlanDetails(req, res, next) {
    try {
      const { id } = req.body;
      const result = await this.paymentService.getPlanDetails(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getPaymentDetails(req, res, next) {
    try {
      const result = await this.paymentService.getPaymentDetails();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async createStripeSession(req, res, next) {
    try {
      const { planId } = req.body;
      const result = await this.paymentService.createStripeSession(req.decode.uid, planId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async payWithRazorpay(req, res, next) {
    try {
      const { rz_payment_id, plan, amount } = req.body;
      const result = await this.paymentService.payWithRazorpay(req.decode.uid, { rz_payment_id, plan, amount });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async payWithPaypal(req, res, next) {
    try {
      const { orderID, plan } = req.body;
      const result = await this.paymentService.payWithPaypal(req.decode.uid, { orderID, plan });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async stripePayment(req, res, next) {
    try {
      const { order, plan } = req.query;
      const result = await this.paymentService.stripePayment(order, plan);
      res.send(result);
    } catch (err) {
      next(err);
    }
  }

  async startFreeTrial(req, res, next) {
    try {
      const { planId } = req.body;
      const result = await this.paymentService.startFreeTrial(req.decode.uid, planId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PaymentController;