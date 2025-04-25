const PaymentRepository = require("../repositories/paymentRepository");

class PaymentController {
  static async getPaymentGateway(req, res) {
    try {
      const data = await PaymentRepository.getPaymentGateway();
      res.json({ data: data || {}, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

  static async updatePaymentGateway(req, res) {
    try {
      const gatewayData = req.body;
      await PaymentRepository.updatePaymentGateway(gatewayData);
      res.json({ success: true, msg: "Payment gateway updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

 static async getPlanDetails(req, res) {
    try {
      const { id } = req.body;
      const result = await paymentService.getPlanDetails(id);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

 static async getPaymentDetails(req, res) {
    try {
      const result = await paymentService.getPaymentDetails();
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

 static async createStripeSession(req, res) {
    try {
      const { planId } = req.body;
      const result = await paymentService.createStripeSession(req.decode.uid, planId);
      res.json(result);
    } catch (error) {
      res.json({ msg: error.toString(), err: error.message });
      console.log(error);
    }
  }

 static async payWithRazorpay(req, res) {
    try {
      const { rz_payment_id, plan, amount } = req.body;
      const result = await paymentService.payWithRazorpay(req.decode.uid, { rz_payment_id, plan, amount });
      res.json(result);
    } catch (error) {
      res.json({ msg: error.toString(), err: error.message });
      console.log(error);
    }
  }

 static async payWithPaypal(req, res) {
    try {
      const { orderID, plan } = req.body;
      const result = await paymentService.payWithPaypal(req.decode.uid, { orderID, plan });
      res.json(result);
    } catch (error) {
      res.json({ msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

 static async stripePayment(req, res) {
    try {
      const { order, plan } = req.query;
      const result = await paymentService.stripePayment(order, plan);
      res.send(result);
    } catch (error) {
      res.json({ msg: 'Something went wrong', err: error.message, success: false });
      console.log(error);
    }
  }

 static async startFreeTrial(req, res) {
    try {
      const { planId } = req.body;
      const result = await paymentService.startFreeTrial(req.decode.uid, planId);
      res.json(result);
    } catch (error) {
      res.json({ msg: 'Something went wrong', err: error.message, success: false });
      console.log(error);
    }
  }
}

module.exports = PaymentController;