const WebPrivate = require("../repositories/WebPrivateRepository");
const OrderRepository = require("../repositories/OrderRepository");
const WebPublic = require("../repositories/WebPublicRepository");
const PlanRepository = require("../repositories/PlanRepository");
const { rzCapturePayment, updateUserPlan } = require("../utils/payment.utils");
const Stripe = require("stripe");
const PaymentDetailsNotFoundException = require("../exceptions/CustomExceptions/PaymentDetailsNotFoundException");
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
const { backendURI, paypalUrl, frontendURI } = require("../config/app.config");
const randomstring = require("randomstring");
const UserRepository = require("../repositories/UserRepository");

class PaymentService {
  WebPrivate;
  PlanRepository;
  WebPublic;
  UserRepository;
  constructor() {
    this.planRepository = new PlanRepository();
    this.webPrivate = new WebPrivate();
    this.orderRepository = new OrderRepository();
    this.webPublic = new WebPublic();
    this.userRepository = new UserRepository();
  }
  async getPaymentDetails() {
    const webPrivate = await this.webPrivate.getWebPrivate();
    if (!webPrivate) {
      throw new PaymentDetailsNotFoundException();
    }
    return { data: { ...webPrivate.dataValues, pay_stripe_key: "" } };
  }

  async createStripeSession(body, uid) {
    const { planId } = body;

    const plan = await this.planRepository.getPlanById(planId);
    if (!plan || plan.length < 1) {
      const error = new Error("No plan found with the id");
      error.status = 400;
      error.type = "PlanNotFoundWithIdException";
      throw error;
    }

    const selectedPlan = plan[0];

    const { secretKey } = await this.webPrivate.getStripeKeys();
    if (!secretKey) {
      throw new Error("Stripe secret key not found in database");
    }

    const stripe = new Stripe(secretKey);
    const orderID = `STRIPE_${randomstring.generate()}`;

    await this.orderRepository.create({
      uid,
      payment_mode: "STRIPE",
      amount: selectedPlan.price,
      data: orderID,
    });

    const web = await this.webPublic.findFirst();

    const productStripe = [
      {
        price_data: {
          currency: web?.currency_code || "usd",
          product_data: {
            name: selectedPlan?.title,
          },
          unit_amount: selectedPlan?.price * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: productStripe,
      mode: "payment",
      success_url: `${process.env.BACKURI}/api/user/stripe_payment?order=${orderID}&plan=${selectedPlan.id}`,
      cancel_url: `${process.env.BACKURI}/api/user/stripe_payment?order=${orderID}&plan=${selectedPlan.id}`,
      locale: process.env.STRIPE_LANG || "en",
    });

    await this.orderRepository.update(
      { s_token: session.id },
      { data: orderID }
    );

    return {
      success: true,
      session: {
        id: session.id,
      },
    };
  }

  async payWithRazorpay(uid, { rz_payment_id, plan, amount }) {
    if (!rz_payment_id || !plan || !amount) {
      throw new FillAllFieldsException();
    }
    const getPlan = await this.orderRepository.findById(plan.id);
    if (!getPlan) {
      throw new InvalidPlanFoundException();
    }
    const webPrivate = await this.webPrivate.getWebPrivate();
    const webPublic = await this.webPrivate.getWebPublic();
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

  const getPlan = await this.orderRepository.findById(plan.id);
  if (!getPlan) {
    throw new InvalidPlanFoundException();
  }

  const webPrivate = await this.webPrivate.getWebPrivate();
  const paypalClientId = webPrivate?.pay_paypal_id;
  const paypalClientSecret = webPrivate?.pay_paypal_key;

  if (!paypalClientId || !paypalClientSecret) {
    throw new PaypalCredentialsRequiredException();
  }

  const response = await fetch(paypalUrl + "/v1/oauth2/token", {
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
  });

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
  const uidStr = typeof uid === 'string' ? uid : uid?.id || uid?.toString?.();

  await updateUserPlan(getPlan, uidStr);

  await this.orderRepository.createOrder(
    uidStr,
    "PAYPAL",
    plan.price,
    JSON.stringify(order_details)
  );

  const durationDays = Number(getPlan?.plan_duration_in_days);
  if (!durationDays || isNaN(durationDays)) {
    throw new Error('Invalid or missing plan duration');
  }

  const planExpiration = new Date();
  planExpiration.setDate(planExpiration.getDate() + durationDays);

  await this.userRepository.updateByUid(uidStr, {
    plan_id: getPlan.id,
    api_key: webPrivate?.pay_paypal_key || null,
    plan_expiration: planExpiration,
  });

  return true;
}




  throw new PaymentProcessingErrorException();
}


  async handleStripePayment(order, plan) {
    const getOrder = await this.orderRepository.findOrderByData(order);
    const getPlan = await this.orderRepository.findById(plan);

    if (!getOrder || !getPlan) {
      throw new InvalidRequestException();
    }

    const webPrivate = await this.webPrivate.getWebPrivate();
    const stripeClient = new Stripe(webPrivate?.pay_stripe_key);

    const session = await stripeClient.checkout.sessions.retrieve(
      getOrder.s_token
    );
    if (session?.payment_status === "paid") {
      await this.orderRepository.updateOrder(order, {
        data: JSON.stringify(session),
      });

      const planDays = parseInt(getPlan.plan_duration_in_days || 0);

      const expirationTimestamp = Date.now() + planDays * 24 * 60 * 60 * 1000;

      await this.userRepository.updateByUid(getOrder.uid, {
        plan_id: getPlan.id,
        plan_expiration: expirationTimestamp,
        api_key: webPrivate?.pay_stripe_key || null,
      });

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
  <meta http-equiv="refresh" content="5;url=${frontendURI}/dashboard">
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
