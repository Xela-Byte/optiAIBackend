const { errorHandling } = require('../../middlewares/errorHandling');
const { User } = require('../../models/User');

const stripe = require('stripe')(process.env.STRIPE_KEY);

exports.createSetupIntent = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      errorHandling(`400|Please provide email.|`);
    } else {
      let existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        errorHandling(`400|User not found.|`);
      } else {
        let existingCustomer = existingUser.customer;

        if (existingCustomer !== '')
          errorHandling(`401|Customer with email, ${email} already exists.|`);

        if (existingCustomer === '') {
          let customer = await stripe.customers.create();

          const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2023-10-16' },
          );

          const paymentIntent = await stripe.paymentIntents.create({
            amount: 999,
            currency: 'usd',
            customer: customer.id,
          });

          existingUser = await User.findOneAndUpdate(
            {
              email,
            },
            {
              customer: customer.id,
            },
            {
              new: true,
            },
          );

          res.status(200).json({
            message: 'Success',
            response: {
              user: existingUser,
              paymentIntent: paymentIntent.client_secret,
              customer: customer.id,
              ephemeralKey: ephemeralKey.secret,
            },
          });
        }
      }
    }
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

