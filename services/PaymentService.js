const WebRepository = require("../repositories/webRepository");
const OrderRepository = require("../repositories/OrderRepository");
const { rzCapturePayment, updateUserPlan } = require("../utils/payment.utils");
const Stripe = require("stripe");
const { generateUid } = require("./../utils/auth.utils");
const PaymentDetailsNotFoundException = require("../exceptions/CustomExceptions/PaymentDetailsNotFoundException");
const PaymentKeysNotFoundException = require("../exceptions/CustomExceptions/PaymentKeysNotFoundException");
const PlanNotFoundWithIdException = require("../exceptions/CustomExceptions/PlanNotFoundWithIdException");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const InvalidPlanFoundException = require("../exceptions/CustomExceptions/InvalidPlanFoundException");
const FillRazorpayCredentialsException = require("../exceptions/CustomExceptions/FillRazorpayCredentialsException");
const OrderIdAndPlanRequiredException = require("../exceptions/CustomExceptions/OrderIdAndPlanRequiredException");
const PaypalCredentialsRequiredException = require("../exceptions/CustomExceptions/PaypalCredentialsRequiredException");
const PaymentProcessingErrorException = require("../exceptions/CustomExceptions/PaymentProcessingErrorException");
const InvalidRequestException = require("../exceptions/CustomExceptions/InvalidRequestException");
const { __t } = require("../utils/locale.utils");
const TrialAlreadyTakenException = require("../exceptions/CustomExceptions/TrialAlreadyTakenException");
const NotATrialPlanException = require("../exceptions/CustomExceptions/NotATrialPlanException");
const { backendURI, stripeLang, paypalUrl } = require("../config/app.config");

class PaymentService {
  webRepository;
  constructor() {
    this.webRepository = new WebRepository();
    this.orderRepository = new OrderRepository();
  }
  async getPaymentDetails() {
    const webPrivate = await this.webRepository.getWebPrivate();
    if (!webPrivate) {
      throw new PaymentDetailsNotFoundException();
    }
    return { data: { ...webPrivate.dataValues, pay_stripe_key: "" } };
  }

  async createStripeSession(uid, planId) {
    const webPrivate = await this.webRepository.getWebPrivate();
    if (!webPrivate?.pay_stripe_key || !webPrivate?.pay_stripe_id) {
      throw new PaymentKeysNotFoundException();
    }
    const stripeClient = new Stripe(webPrivate.pay_stripe_key);
    const plan = await this.orderRepository.findPlanById(planId);
    if (!plan) {
      throw new PlanNotFoundWithIdException();
    }
    const randomSt = generateUid();
    const orderID = `STRIPE_${randomSt}`;
    await this.orderRepository.createOrder({
      uid,
      payment_mode: "STRIPE",
      amount: plan.price,
      data: orderID,
    });
    const webPublic = await this.webRepository.getWebPublic();
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: webPublic.currency_code,
            product_data: { name: plan.title },
            unit_amount: plan.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${backendURI}/api/user/stripe_payment?order=${orderID}&plan=${plan.id}`,
      cancel_url: `${backendURI}/api/user/stripe_payment?order=${orderID}&plan=${plan.id}`,
      locale: stripeLang || "en",
    });
    await this.orderRepository.updateOrder(orderID, { s_token: session.id });
    return { session };
  }

  async payWithRazorpay(uid, { rz_payment_id, plan, amount }) {
    if (!rz_payment_id || !plan || !amount) {
      throw new FillAllFieldsException();
    }
    const getPlan = await this.orderRepository.findPlanById(plan.id);
    if (!getPlan) {
      throw new InvalidPlanFoundException();
    }
    const webPrivate = await this.webRepository.getWebPrivate();
    const webPublic = await this.webRepository.getWebPublic();
    const rzId = webPrivate?.rz_id;
    const rzKey = webPrivate?.rz_key;
    if (!rzId || !rzKey) {
      throw new FillRazorpayCredentialsException();
    }
    const finalamt =
      (parseInt(amount) / parseInt(webPublic.exchange_rate)) * 80;
    const resp = await rzCapturePayment(
      rz_payment_id,
      Math.round(finalamt) * 100,
      rzId,
      rzKey
    );
    if (!resp) {
      return { msg: resp.description };
    }
    await updateUserPlan(getPlan, uid);
    await this.orderRepository.createOrder({
      uid,
      payment_mode: "RAZORPAY",
      amount: plan.price,
      data: JSON.stringify(resp),
    });
    return true;
  }

  async payWithPaypal(uid, { orderID, plan }) {
    if (!orderID || !plan) {
      throw new OrderIdAndPlanRequiredException();
    }
    const getPlan = await this.orderRepository.findPlanById(plan.id);
    if (!getPlan) {
      throw new InvalidPlanFoundException();
    }
    const webPrivate = await this.webRepository.getWebPrivate();
    const paypalClientId = webPrivate?.pay_paypal_id;
    const paypalClientSecret = webPrivate?.pay_paypal_key;
    if (!paypalClientId || !paypalClientSecret) {
      throw new PaypalCredentialsRequiredException();
    }
    const response = await fetch(
      paypalUrl + "/v1/oauth2/token",
      {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${paypalClientId}:${paypalClientSecret}`,
              "binary"
            ).toString("base64"),
        },
      }
    );
    const data = await response.json();
    const resp_order = await fetch(
      paypalUrl + `/v1/checkout/orders/${orderID}`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + data.access_token },
      }
    );
    const order_details = await resp_order.json();
    if (order_details.status === "COMPLETED") {
      await updateUserPlan(getPlan, uid);
      await this.orderRepository.createOrder({
        uid,
        payment_mode: "PAYPAL",
        amount: plan.price,
        data: JSON.stringify(order_details),
      });
      return true;
    }
    throw new PaymentProcessingErrorException();
  }

  async stripePayment(order, plan) {
    const getOrder = await this.orderRepository.findOrderByData(order);
    const getPlan = await this.orderRepository.findPlanById(plan);
    if (!getOrder || !getPlan) {
      throw new InvalidRequestException();
    }
    const webPrivate = await this.webRepository.getWebPrivate();
    const stripeClient = new Stripe(webPrivate?.pay_stripe_key);
    const getPay = await stripeClient.checkout.sessions.retrieve(
      getOrder.s_token
    );
    if (getPay?.payment_status === "paid") {
      await this.orderRepository.updateOrder(order, {
        data: JSON.stringify(getPay),
      });
      await updateUserPlan(getPlan, getOrder.uid);
      return this.returnHtmlRes(__t("payment_success_redirecting"));
    }
    return __t("payment_failed_redirecting");
  }

  async startFreeTrial(uid, planId) {
    const user = await userRepository.findByUid(uid);
    if (user.trial > 0) {
      throw new TrialAlreadyTakenException();
    }
    const plan = await this.orderRepository.findPlanById(planId);
    if (!plan) {
      throw new PlanNotFoundWithIdException();
    }
    if (plan.price > 0) {
      throw new NotATrialPlanException();
    }
    await this.orderRepository.createOrder({
      uid,
      payment_mode: "OFFLINE",
      amount: 0,
      data: JSON.stringify({ plan }),
    });
    await updateUserPlan(plan, uid);
    await userRepository.update(uid, { trial: 1 });
    return true;
  }

  async getPlanDetails(id) {
    const plan = await this.orderRepository.findPlanById(id);
    return { success: !!plan, data: plan || null };
  }

  returnHtmlRes(msg) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="5;url=${backendURI}/user">
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
