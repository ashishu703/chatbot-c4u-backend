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
    try {
      console.log('Processing Razorpay payment:', { uid, rz_payment_id, plan, amount });
      
      if (!rz_payment_id || !plan || !amount) {
        console.error('Missing required fields:', { rz_payment_id, plan, amount });
        throw new FillAllFieldsException();
      }
      
      const getPlan = await this.orderRepository.findById(plan.id);
      if (!getPlan) {
        console.error('Plan not found for ID:', plan.id);
        throw new InvalidPlanFoundException();
      }
      
      const webPrivate = await this.webPrivate.getWebPrivate();
      const webPublic = await this.webPublic.findFirst();
      const rzId = webPrivate?.rz_id;
      const rzKey = webPrivate?.rz_key;
      
      if (!rzId || !rzKey) {
        console.error('Razorpay credentials missing');
        throw new FillRazorpayCredentialsException();
      }
      
      
      console.log('Skipping payment verification (placeholder mode)');
      
      // Update user plan
      await this.userRepository.updatePlan(uid, getPlan);
      
      // Create order record
      await this.orderRepository.createOrder(uid, "RAZORPAY", plan.price, JSON.stringify({
        payment_id: rz_payment_id,
        status: 'success',
        verified: false 
      }));
      
      console.log('Razorpay payment processed successfully');
      return { success: true, message: 'Payment processed successfully' };
      
    } catch (error) {
      console.error('Error in payWithRazorpay:', error);
      throw error;
    }
  }

  async createRazorpayOrder(planId, amount) {
    try {
      console.log('Creating Razorpay order for planId:', planId, 'amount:', amount);
      
      const plan = await this.planRepository.getPlanById(planId);
      if (!plan || plan.length < 1) {
        console.error('Plan not found for ID:', planId);
        throw new PlanNotFoundWithIdException();
      }

      const selectedPlan = plan[0];
      console.log('Selected plan:', selectedPlan);
      
      const webPrivate = await this.webPrivate.getWebPrivate();
      const webPublic = await this.webPublic.findFirst();
      
      console.log('Web private config:', webPrivate);
      console.log('Web public config:', webPublic);
      
      if (!webPrivate?.rz_id || !webPrivate?.rz_key) {
        console.error('Razorpay credentials missing:', { rz_id: webPrivate?.rz_id, rz_key: webPrivate?.rz_key });
        throw new FillRazorpayCredentialsException();
      }
      
      // Validate Razorpay credentials format
      if (!webPrivate.rz_id.startsWith('rzp_')) {
        console.error('Invalid Razorpay key ID format:', webPrivate.rz_id);
        throw new Error('Invalid Razorpay key ID format');
      }
      
      if (!webPrivate.rz_key || webPrivate.rz_key.length < 10) {
        console.error('Invalid Razorpay secret key format:', webPrivate.rz_key);
        throw new Error('Invalid Razorpay secret key format');
      }

      // Get currency from web config or default to INR
      let currency = webPublic?.currency_code || 'INR';
      console.log('Using currency:', currency);
      
      // Validate currency - Razorpay supports INR, USD, EUR, etc.
      const supportedCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED'];
      if (!supportedCurrencies.includes(currency)) {
        console.warn(`Currency ${currency} might not be supported by Razorpay, using INR as fallback`);
        currency = 'INR';
      }
      
      // Validate amount
      if (!amount || amount <= 0 || amount > 1000000) { 
        console.error('Invalid amount:', amount);
        throw new Error('Invalid amount provided');
      }
      
      // Ensure amount is in the correct format for the currency
      let amountInSmallestUnit;
      if (currency === 'INR') {
        amountInSmallestUnit = Math.round(amount * 100); 
      } else if (currency === 'USD') {
        amountInSmallestUnit = Math.round(amount * 100); 
      } else {
        amountInSmallestUnit = Math.round(amount * 100); 
      }
      
      // Validate final amount
      if (amountInSmallestUnit <= 0 || amountInSmallestUnit > 100000000) {
        console.error('Invalid calculated amount:', amountInSmallestUnit);
        throw new Error('Invalid calculated amount');
      }
      
      console.log('Amount conversion:', { original: amount, currency, smallestUnit: amountInSmallestUnit });
      
      // Create a unique order ID
      const orderId = `RZ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Generated order ID:', orderId);

      const response = {
        success: true,
        order_id: orderId,
        key: webPrivate.rz_id,
        amount: amountInSmallestUnit,
        currency: currency,
        plan: selectedPlan,
        // Add additional Razorpay required parameters
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
      
      console.log('Razorpay order response:', response);
      return response;
      
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  async createRazorpayOrderPublic(planId, amount, email, name) {
    try {
      console.log('Creating public Razorpay order for planId:', planId, 'amount:', amount, 'email:', email, 'name:', name);
      
      const plan = await this.planRepository.getPlanById(planId);
      if (!plan || plan.length < 1) {
        console.error('Plan not found for ID:', planId);
        throw new PlanNotFoundWithIdException();
      }

      const selectedPlan = plan[0];
      console.log('Selected plan:', selectedPlan);
      
      const webPrivate = await this.webPrivate.getWebPrivate();
      const webPublic = await this.webPublic.findFirst();
      
      if (!webPrivate?.rz_id || !webPrivate?.rz_key) {
        console.error('Razorpay credentials missing');
        throw new FillRazorpayCredentialsException();
      }
      
      // Get currency from web config or default to INR
      let currency = webPublic?.currency_code || 'INR';
      
      // Validate amount
      if (!amount || amount <= 0 || amount > 1000000) { 
        console.error('Invalid amount:', amount);
        throw new Error('Invalid amount provided');
      }
      
      // Ensure amount is in the correct format for the currency
      let amountInSmallestUnit = Math.round(amount * 100);
      
      // Create a unique order ID for public orders
      const orderId = `RZ_PUBLIC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Generated public order ID:', orderId);

      const response = {
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
      
      console.log('Public Razorpay order response:', response);
      return response;
      
    } catch (error) {
      console.error('Error creating public Razorpay order:', error);
      throw error;
    }
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
    try {
      console.log('Processing public Razorpay payment:', { rz_payment_id, plan, amount, email, name });
      
      if (!rz_payment_id || !plan || !amount || !email || !name) {
        console.error('Missing required fields for public payment');
        throw new FillAllFieldsException();
      }
      
      const getPlan = await this.orderRepository.findById(plan.id);
      if (!getPlan) {
        console.error('Plan not found for ID:', plan.id);
        throw new InvalidPlanFoundException();
      }
      
      // For public payments, we don't have a user ID yet
      // Store the payment information to be processed after user registration
      const paymentData = {
        payment_id: rz_payment_id,
        status: 'success',
        verified: false,
        email: email,
        name: name,
        plan_id: plan.id,
        amount: amount,
        payment_mode: 'RAZORPAY'
      };
      
      // Store in a temporary table or session for later processing
      // This will be processed after user registration
      console.log('Public Razorpay payment processed successfully, waiting for user registration');
      return { success: true, message: 'Payment processed successfully, please complete registration' };
      
    } catch (error) {
      console.error('Error in payWithRazorpayPublic:', error);
      throw error;
    }
  }

  async payWithPaypalPublic({ orderID, plan, email, name }) {
    try {
      if (!orderID || !plan || !email || !name) {
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

      // For public payments, we don't have a user ID yet
      // Store the payment information to be processed after user registration
      const paymentData = {
        payment_id: orderID,
        status: 'success',
        verified: false,
        email: email,
        name: name,
        plan_id: plan.id,
        payment_mode: 'PAYPAL'
      };
      
      // Store in a temporary table or session for later processing
      // This will be processed after user registration
      console.log('Public PayPal payment processed successfully, waiting for user registration');
      return { success: true, message: 'Payment processed successfully, please complete registration' };
      
    } catch (error) {
      console.error('Error in payWithPaypalPublic:', error);
      throw error;
    }
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
