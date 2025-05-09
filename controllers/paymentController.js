const PaymentRepository = require("../repositories/paymentRepository");
const PaymentService = require("../services/PaymentService");
class PaymentController {
  paymentRepository;
  paymentService;
  constructor(){
    this.paymentRepository = new PaymentRepository();
    this.paymentService =new PaymentService();
  }
   async getPaymentGateway(req, res) {
    try {
      const data = await this.paymentRepository.getPaymentGateway();
      res.json({ data: data || {}, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

   async updatePaymentGateway(req, res) {
    try {
      const gatewayData = req.body;
      await this.paymentRepository.updatePaymentGateway(gatewayData);
      res.json({ success: true, msg: "Payment gateway updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

  async getPlanDetails(req, res) {
    try {
      const { id } = req.body;
      const result = await this.paymentService.getPlanDetails(id);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async getPaymentDetails(req, res) {
    try {
      const result = await this.paymentService.getPaymentDetails();
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async createStripeSession(req, res) {
    try {
      const { planId } = req.body;
      const result = await this.paymentService.createStripeSession(req.decode.uid, planId);
      res.json(result);
    } catch (error) {
      res.json({ msg: error.toString(), err: error.message });
      console.log(error);
    }
  }

  async payWithRazorpay(req, res) {
    try {
      const { rz_payment_id, plan, amount } = req.body;
      const result = await this.paymentService.payWithRazorpay(req.decode.uid, { rz_payment_id, plan, amount });
      res.json(result);
    } catch (error) {
      res.json({ msg: error.toString(), err: error.message });
      console.log(error);
    }
  }

  async payWithPaypal(req, res) {
    try {
      const { orderID, plan } = req.body;
      const result = await this.paymentService.payWithPaypal(req.decode.uid, { orderID, plan });
      res.json(result);
    } catch (error) {
      res.json({ msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async stripePayment(req, res) {
    try {
      const { order, plan } = req.query;
      const result = await this.paymentService.stripePayment(order, plan);
      res.send(result);
    } catch (error) {
      res.json({ msg: 'Something went wrong', err: error.message, success: false });
      console.log(error);
    }
  }

  async startFreeTrial(req, res) {
    try {
      const { planId } = req.body;
      const result = await this.paymentService.startFreeTrial(req.decode.uid, planId);
      res.json(result);
    } catch (error) {
      res.json({ msg: 'Something went wrong', err: error.message, success: false });
      console.log(error);
    }
  }
}

module.exports = PaymentController;