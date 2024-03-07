const cors = require('cors');
require('dotenv').config();
const express = require('express');
const { connectToDB } = require('./config/database');
const router = require('./routes/userRoutes');
const { errorProcessing } = require('./middlewares/errorHandling');
const paymentRouter = require('./routes/paymentRoutes');

const app = express();

const whitelist = [];

app.use(
  cors({
    origin: whitelist,
    method: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  }),
);

app.use(express.json());
app.use('/auth', router);
app.use('/payment', paymentRouter);

//Handle invalid endpoint
app.use((_, __, next) => {
  next({
    errorCode: 404,
    errorMessage: {
      statusCode: 404,
      message: 'Invalid Endpoint.',
    },
  });
});

app.use((error, request, response, next) => {
  if (error instanceof Error) error = errorProcessing(error);
  const statusCode = error.errorCode ? error.errorCode : 500;
  const statusMessage = error.errorMessage
    ? error.errorMessage
    : { error: { message: 'Internal server error.' } };
  // if status code is 500, log error to error.log file.
  response.status(parseInt(statusCode)).json(statusMessage);
});

const PORT = process.env.PORT || 5000;
const setUpServer = () => {
  connectToDB('photoToText', () => {
    app.listen(PORT, () => {
      console.log(`Connected to port ${PORT} sucessfully`);
    });
  });
};

setUpServer();

