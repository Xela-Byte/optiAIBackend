const express = require('express');
const {
  createSetupIntent,
  createSubscription,
} = require('../controllers/payment/paymentController');

const paymentRouter = express.Router();

paymentRouter.post('/create-setup-intent', createSetupIntent);
paymentRouter.post('/create-subscription', createSubscription);

module.exports = paymentRouter;

