const WebPrivate = require("../repositories/WebPrivateRepository");
const OrderRepository = require("../repositories/OrderRepository");
const WebPublic = require("../repositories/WebPublicRepository");
const PlanRepository = require("../repositories/PlanRepository");
const { rzCapturePayment } = require("../utils/payment.utils");
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

  async createStripeSessionPublic(planId, email, name) {
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
    const orderID = `STRIPE_PUBLIC_${randomstring.generate()}`;

    // Create order without user ID for public payments
    await this.orderRepository.create({
      uid: null, // No user ID for public payments
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
      success_url: `${process.env.BACKURI}/api/user/stripe_payment?order=${orderID}&plan=${selectedPlan.id}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`,
      cancel_url: `${process.env.BACKURI}/api/user/stripe_payment?order=${orderID}&plan=${selectedPlan.id}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`,
      locale: process.env.STRIPE_LANG || "en",
      customer_email: email,
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
    const rzId = webPrivate?.rz_id;
    const rzKey = webPrivate?.rz_key;
    
    if (!rzId || !rzKey) {
      throw new FillRazorpayCredentialsException();
    }
    
    await this.userRepository.updatePlan(uid, getPlan);
    
    await this.orderRepository.createOrder(uid, "RAZORPAY", plan.price, JSON.stringify({
      payment_id: rz_payment_id,
      status: 'success',
      verified: false 
    }));
    
    return { success: true, message: 'Payment processed successfully' };
  }

  async createRazorpayOrder(planId, amount) {
    const plan = await this.planRepository.getPlanById(planId);
    if (!plan || plan.length < 1) {
      throw new PlanNotFoundWithIdException();
    }

    const selectedPlan = plan[0];
    const webPrivate = await this.webPrivate.getWebPrivate();
    const webPublic = await this.webPublic.findFirst();
    
    if (!webPrivate?.rz_id || !webPrivate?.rz_key) {
      throw new FillRazorpayCredentialsException();
    }
    
    const currency = 'INR';
    
    if (!amount || amount <= 0 || amount > 1000000) { 
      throw new Error('Invalid amount provided');
    }
    
    const amountInSmallestUnit = Math.round(amount * 100);
    
    if (amountInSmallestUnit <= 0 || amountInSmallestUnit > 100000000) {
      throw new Error('Invalid calculated amount');
    }
    
    const orderId = `RZ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      order_id: orderId,
      key: webPrivate.rz_id,
      amount: amountInSmallestUnit,
      currency: currency,
      plan: selectedPlan,
      name: 'Subscription Payment',
      description: selectedPlan.title || 'Plan Subscription',
      prefill: {
        email: '', 
        contact: '' 
      },
      notes: {
        plan_id: selectedPlan.id.toString(),
        plan_name: selectedPlan.title
      }
    };
  }

  async createRazorpayOrderPublic(planId, amount, email, name) {
    const plan = await this.planRepository.getPlanById(planId);
    if (!plan || plan.length < 1) {
      throw new PlanNotFoundWithIdException();
    }

    const selectedPlan = plan[0];
    const webPrivate = await this.webPrivate.getWebPrivate();
    const webPublic = await this.webPublic.findFirst();
    
    if (!webPrivate?.rz_id || !webPrivate?.rz_key) {
      throw new FillRazorpayCredentialsException();
    }
    
    const currency = 'INR';
    
    if (!amount || amount <= 0 || amount > 1000000) { 
      throw new Error('Invalid amount provided');
    }
    
    const amountInSmallestUnit = Math.round(amount * 100);
    const orderId = `RZ_PUBLIC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      order_id: orderId,
      key: webPrivate.rz_id,
      amount: amountInSmallestUnit,
      currency: currency,
      plan: selectedPlan,
      name: 'Subscription Payment',
      description: selectedPlan.title || 'Plan Subscription',
      prefill: {
        email: email, 
        contact: '' 
      },
      notes: {
        plan_id: selectedPlan.id.toString(),
        plan_name: selectedPlan.title,
        email: email,
        name: name
      }
    };
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

  await this.userRepository.updatePlan(uidStr, getPlan);

  await this.orderRepository.createOrder(
    uidStr,
    "PAYPAL",
    plan.price,
    JSON.stringify(order_details)
  );

  await this.userRepository.updateByUid(uidStr, {
    api_key: webPrivate?.pay_paypal_key || null,
  });

  return true;
}




  throw new PaymentProcessingErrorException();
}


  async handleStripePayment(order, plan, email = null, name = null) {
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

      if (!getOrder.uid && email && name) {
        const paymentData = {
          payment_id: session.id,
          email: email,
          name: name,
          plan_id: getPlan.id,
          amount: getPlan.price,
          payment_mode: 'STRIPE'
        };
        
        const tempUid = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await this.orderRepository.updateOrder(order, {
          uid: tempUid,
          payment_mode: "STRIPE_PUBLIC",
          data: JSON.stringify(paymentData),
        });
        
        return this.returnHtmlRes(__t("payment_success_redirecting"));
      }

      if (getOrder.uid) {
        await this.userRepository.updatePlan(getOrder.uid, getPlan);
        await this.userRepository.updateByUid(getOrder.uid, {
          api_key: webPrivate?.pay_stripe_key || null,
        });
      }

      return this.returnHtmlRes(__t("payment_success_redirecting"));
    }
    return __t("payment_failed_redirecting");
  }

  async startFreeTrial(uid, planId) {
    const user = await this.userRepository.findByUid(uid);
    if (user.trial > 0) {
      throw new TrialAlreadyTakenException();
    }
    const plan = await this.planRepository.findPlanById(planId);
    if (!plan) {
      throw new PlanNotFoundWithIdException();
    }
    if (plan.price > 0) {
      throw new NotATrialPlanException();
    }
    await this.orderRepository.createOrder(uid, "OFFLINE", 0, JSON.stringify({ plan }));
    await this.userRepository.updatePlan(uid, plan);
    await this.userRepository.update(uid, { trial: 1 });
    return true;
  }

  async getPlanDetails(id) {
    const plan = await this.planRepository.findPlanById(id);
    return { success: !!plan, data: plan || null };
  }

  async payWithRazorpayPublic({ rz_payment_id, plan, amount, email, name }) {
    if (!rz_payment_id || !plan || !amount || !email || !name) {
      throw new FillAllFieldsException();
    }
    
    const getPlan = await this.orderRepository.findById(plan.id);
    if (!getPlan) {
      throw new InvalidPlanFoundException();
    }
    
    const tempUid = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentData = {
      payment_id: rz_payment_id,
      email: email,
      name: name,
      plan_id: plan.id,
      amount: amount,
      payment_mode: 'RAZORPAY'
    };
    
    await this.orderRepository.create({
      uid: tempUid,
      payment_mode: "RAZORPAY_PUBLIC",
      amount: amount,
      data: JSON.stringify(paymentData),
      s_token: `TEMP_${rz_payment_id}`,
    });
    
    return { success: true, message: 'Payment processed successfully, please complete registration' };
  }

  async payWithPaypalPublic({ orderID, plan, email, name }) {
    if (!orderID || !plan || !email || !name) {
      throw new OrderIdAndPlanRequiredException();
    }

    const getPlan = await this.orderRepository.findById(plan.id);
    if (!getPlan) {
      throw new InvalidPlanFoundException();
    }

    const tempUid = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const paymentData = {
      payment_id: orderID,
      email: email,
      name: name,
      plan_id: plan.id,
      amount: plan.price,
      payment_mode: 'PAYPAL'
    };
    
    await this.orderRepository.create({
      uid: tempUid,
      payment_mode: "PAYPAL_PUBLIC",
      amount: plan.price,
      data: JSON.stringify(paymentData),
      s_token: `TEMP_${orderID}`,
    });
    
    return { success: true, message: 'Payment processed successfully, please complete registration' };
  }

  async processPendingPayment(email) {
    const pendingOrder = await this.orderRepository.findFirst({
      where: {
        uid: {
          [require('sequelize').Op.like]: 'TEMP_%'
        },
        payment_mode: ['RAZORPAY_PUBLIC', 'PAYPAL_PUBLIC', 'STRIPE_PUBLIC'],
        data: {
          [require('sequelize').Op.like]: `%"email":"${email}"%`
        }
      }
    });
    
    if (!pendingOrder) {
      return null;
    }
    
    const paymentData = JSON.parse(pendingOrder.data);
    
    return {
      orderId: pendingOrder.id,
      paymentData: paymentData,
      planId: paymentData.plan_id
    };
  }

  async completePendingPayment(uid, pendingPayment) {
    const { paymentData, orderId } = pendingPayment;
    const plan = await this.orderRepository.findById(paymentData.plan_id);
    
    await this.userRepository.updatePlan(uid, plan);
    
    await this.orderRepository.updateOrder(orderId, {
      uid: uid,
      payment_mode: paymentData.payment_mode.replace('_PUBLIC', ''),
      data: JSON.stringify({
        ...paymentData,
        completed: true,
        uid: uid
      })
    });
    
    return true;
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
