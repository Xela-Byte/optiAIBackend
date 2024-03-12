const { errorHandling } = require('../../middlewares/errorHandling');
const { User } = require('../../models/User');

const stripe = require('stripe')(process.env.STRIPE_KEY);

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

exports.updateSubscription = async (req, res, next) => {
  const { email, subscriptionId } = req.body;
  try {
    if (!email) {
      errorHandling(`400|Please provide email.|`);
    } else {
      let existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        errorHandling(`400|User not found.|`);
      } else {
        existingUser = await User.findOneAndUpdate(
          {
            email,
          },
          {
            subscription: {
              active: true,
              subscriptionId,
            },
          },
          {
            new: true,
          },
        );

        return res.status(200).json({
          message: 'Success',
          response: {
            user: existingUser,
          },
        });
      }
    }
  } catch (err) {
    next(new Error(err.stack));
  }
};

exports.cancelSubscription = async (req, res, next) => {
  const subscriptionId = req.query.subscriptionId;
  try {
    let existingUser = await User.findOne({
      subscription: {
        active: true,
        subscriptionId,
      },
    });
    if (!existingUser) {
      errorHandling(`400|User not found.|`);
    } else {
      const deletedSubscription =
        await stripe.subscriptions.cancel(subscriptionId);

      existingUser = await User.findOneAndUpdate(
        {
          subscription: {
            active: true,
            subscriptionId,
          },
        },
        {
          subscription: {
            active: false,
            subscriptionId: '',
          },
        },
        {
          new: true,
        },
      );

      return res.status(200).json({
        message: 'Success',
        response: {
          user: existingUser,
          deletedSubscription,
        },
      });
    }
  } catch (err) {
    next(new Error(err.stack));
  }
};

