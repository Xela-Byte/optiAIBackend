const express = require('express');
const {
  createSubscription,
  updateSubscription,
  cancelSubscription,
} = require('../controllers/payment/paymentController');

const paymentRouter = express.Router();

paymentRouter.post('/create-subscription', createSubscription);
paymentRouter.patch('/update-subscription', updateSubscription);
paymentRouter.delete('/cancel-subscription', cancelSubscription);

module.exports = paymentRouter;

