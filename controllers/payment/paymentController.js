const { errorHandling } = require('../../middlewares/errorHandling');

const stripe = require('stripe')(process.env.STRIPE_KEY);

exports.createSetupIntent = async (req, res, next) => {
  try {
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2023-10-16' },
    );
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
    });
    return res.status(200).json({
      message: 'Success',
      response: {
        setupIntent: setupIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
      },
    });
  } catch (e) {
    next(new Error(e.stack));
  }
};

exports.handlePaymentIntent = async (req, res, next) => {
  const { amount, currency, gateway } = req.body;

  try {
    if (!amount || !currency || !gateway) {
      errorHandling(`400|Please provide all fields.|`);
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: [gateway],
    });
    return res.status(200).json({
      message: 'Success',
      response: paymentIntent,
    });
  } catch (e) {
    next(new Error(e.stack));
  }
};

