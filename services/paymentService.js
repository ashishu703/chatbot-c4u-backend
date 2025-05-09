const WebRepository = require('../repositories/webRepository');
const OrderRepository = require('../repositories/orderRepository');
const { rzCapturePayment, updateUserPlan } = require('../utils/paymentUtils');
const Stripe = require('stripe');
const randomstring = require('randomstring');

class PaymentService {
  webRepository;
  constructor(){
    this.webRepository= new WebRepository();
    this.orderRepository = new OrderRepository();
  }
  async getPaymentDetails() {
    const webPrivate = await this.webRepository.getWebPrivate();
    if (!webPrivate) {
      return { success: false, msg: 'Payment details not found' };
    }
    return { success: true, data: { ...webPrivate.dataValues, pay_stripe_key: '' } };
  }

  async createStripeSession(uid, planId) {
    const webPrivate = await this.webRepository.getWebPrivate();
    if (!webPrivate?.pay_stripe_key || !webPrivate?.pay_stripe_id) {
      return { success: false, msg: 'Opss.. payment keys found not found' };
    }
    const stripeClient = new Stripe(webPrivate.pay_stripe_key);
    const plan = await this.orderRepository.findPlanById(planId);
    if (!plan) {
      return { success: false, msg: 'No plan found with the id' };
    }
    const randomSt = randomstring.generate();
    const orderID = `STRIPE_${randomSt}`;
    await this.orderRepository.createOrder({ uid, payment_mode: 'STRIPE', amount: plan.price, data: orderID });
    const webPublic = await this.webRepository.getWebPublic();
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: webPublic.currency_code,
          product_data: { name: plan.title },
          unit_amount: plan.price * 100
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.BACKURI}/api/user/stripe_payment?order=${orderID}&plan=${plan.id}`,
      cancel_url: `${process.env.BACKURI}/api/user/stripe_payment?order=${orderID}&plan=${plan.id}`,
      locale: process.env.STRIPE_LANG || 'en'
    });
    await this.orderRepository.updateOrder(orderID, { s_token: session.id });
    return { success: true, session };
  }

  async payWithRazorpay(uid, { rz_payment_id, plan, amount }) {
    if (!rz_payment_id || !plan || !amount) {
      return { success: false, msg: 'Please send required fields' };
    }
    const getPlan = await this.orderRepository.findPlanById(plan.id);
    if (!getPlan) {
      return { success: false, msg: 'Invalid plan found' };
    }
    const webPrivate = await this.webRepository.getWebPrivate();
    const webPublic = await this.webRepository.getWebPublic();
    const rzId = webPrivate?.rz_id;
    const rzKey = webPrivate?.rz_key;
    if (!rzId || !rzKey) {
      return { success: false, msg: `Please fill your razorpay credentials! id: ${rzId} keys: ${rzKey}` };
    }
    const finalamt = (parseInt(amount) / parseInt(webPublic.exchange_rate)) * 80;
    const resp = await rzCapturePayment(rz_payment_id, Math.round(finalamt) * 100, rzId, rzKey);
    if (!resp) {
      return { success: false, msg: resp.description };
    }
    await updateUserPlan(getPlan, uid);
    await this.orderRepository.createOrder({ uid, payment_mode: 'RAZORPAY', amount: plan.price, data: JSON.stringify(resp) });
    return { success: true, msg: 'Thank for your payment you are good to go now.' };
  }

  async payWithPaypal(uid, { orderID, plan }) {
    if (!orderID || !plan) {
      return { success: false, msg: 'Order id and plan required' };
    }
    const getPlan = await this.orderRepository.findPlanById(plan.id);
    if (!getPlan) {
      return { success: false, msg: 'Invalid plan found' };
    }
    const webPrivate = await this.webRepository.getWebPrivate();
    const paypalClientId = webPrivate?.pay_paypal_id;
    const paypalClientSecret = webPrivate?.pay_paypal_key;
    if (!paypalClientId || !paypalClientSecret) {
      return { success: false, msg: 'Please provide paypal ID and keys from the Admin' };
    }
    const response = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${paypalClientId}:${paypalClientSecret}`, 'binary').toString('base64')
      }
    });
    const data = await response.json();
    const resp_order = await fetch(`https://api.sandbox.paypal.com/v1/checkout/orders/${orderID}`, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + data.access_token }
    });
    const order_details = await resp_order.json();
    if (order_details.status === 'COMPLETED') {
      await updateUserPlan(getPlan, uid);
      await this.orderRepository.createOrder({ uid, payment_mode: 'PAYPAL', amount: plan.price, data: JSON.stringify(order_details) });
      return { success: true, msg: 'Thank for your payment you are good to go now.' };
    }
    return { success: false, msg: 'Error in payment processing' };
  }

  async stripePayment(order, plan) {
    const getOrder = await this.orderRepository.findOrderByData(order);
    const getPlan = await this.orderRepository.findPlanById(plan);
    if (!getOrder || !getPlan) {
      return 'Invalid request';
    }
    const webPrivate = await this.webRepository.getWebPrivate();
    const stripeClient = new Stripe(webPrivate?.pay_stripe_key);
    const getPay = await stripeClient.checkout.sessions.retrieve(getOrder.s_token);
    if (getPay?.payment_status === 'paid') {
      await this.orderRepository.updateOrder(order, { data: JSON.stringify(getPay) });
      await updateUserPlan(getPlan, getOrder.uid);
      return this.returnHtmlRes('Payment Success! Redirecting...');
    }
    return 'Payment Failed! If the balance was deducted please contact to the HamWiz support. Redirecting...';
  }

  async startFreeTrial(uid, planId) {
    const user = await userRepository.findByUid(uid);
    if (user.trial > 0) {
      return { success: false, msg: 'You have already taken Trial once. You can not enroll for trial again.' };
    }
    const plan = await this.orderRepository.findPlanById(planId);
    if (!plan) {
      return { success: false, msg: 'Invalid plan found' };
    }
    if (plan.price > 0) {
      return { success: false, msg: 'This plan is not a trial plan.' };
    }
    await this.orderRepository.createOrder({ uid, payment_mode: 'OFFLINE', amount: 0, data: JSON.stringify({ plan }) });
    await updateUserPlan(plan, uid);
    await userRepository.update(uid, { trial: 1 });
    return { success: true, msg: 'Your trial plan has been activated. You are redirecting to the panel...' };
  }

  async getPlanDetails(id) {
    const plan = await this.orderRepository.findPlanById(id);
    return { success: !!plan, data: plan || null };
  }

  returnHtmlRes(msg) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="5;url=${process.env.BACKURI}/user">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; text-align: center; margin: 0; padding: 0; }
    .container { background-color: #ffffff; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); margin: 100px auto; padding: 20px; width: 300px; }
    p { font-size: 18px; color: #333; }
  </style>
</head>
<body>
  <div class="container"><p>${msg}</p></div>
</body>
</html>`;
  }
}

module.exports = PaymentService;