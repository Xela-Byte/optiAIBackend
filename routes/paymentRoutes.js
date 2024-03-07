const express = require('express');
const {
  handlePaymentIntent,
  createSetupIntent,
} = require('../controllers/payment/paymentController');

const paymentRouter = express.Router();

paymentRouter.post('/create-setup-intent', createSetupIntent);
paymentRouter.post('/handle-setup-intent', handlePaymentIntent);

module.exports = paymentRouter;

