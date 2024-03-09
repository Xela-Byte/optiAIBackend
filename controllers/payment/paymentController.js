const { errorHandling } = require('../../middlewares/errorHandling');

const stripe = require('stripe')(process.env.STRIPE_KEY);

exports.createSetupIntent = async (req, res, next) => {
  try {
    let customer = await stripe.customers.create();

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2023-10-16' },
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 9.99,
      currency: 'usd',
      customer: customer.id,
    });

    res.status(200).json({
      message: 'Success',
      response: {
        paymentIntent: paymentIntent.client_secret,
        customer: customer.id,
        ephemeralKey: ephemeralKey.secret,
      },
    });
  } catch (e) {
    next(new Error(e.stack));
  }
};

exports.createSubscription = async (req, res, next) => {
  const customerId = req.body.customer;
  const priceId = req.body.priceId;

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.status(200).json({
      message: 'Success',
      response: {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      },
    });
  } catch (e) {
    next(new Error(e.stack));
  }
};

