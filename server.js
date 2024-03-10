const cors = require('cors');
require('dotenv').config();
const express = require('express');
const socketIo = require('socket.io');
const { connectToDB } = require('./config/database');
const router = require('./routes/userRoutes');
const http = require('http');
const { errorProcessing } = require('./middlewares/errorHandling');
const paymentRouter = require('./routes/paymentRoutes');
const promptRouter = require('./routes/promptRoutes');
const { Prompt } = require('./models/Prompt');

const app = express();

const server = http.createServer(app);
const io = socketIo(server);

const whitelist = [];

app.use(
  cors({
    origin: whitelist,
    method: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  }),
);

io.on('connection', async (socket) => {
  console.log('Client connected');
  try {
    const prompts = await Prompt.find();
    socket.emit('prompts', prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

Prompt.watch().on('change', async () => {
  try {
    const prompts = await Prompt.find();
    socket.emit('prompts', prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
  }
});

app.use(express.json());
app.use('/auth', router);
app.use('/payment', paymentRouter);
app.use('/prompt', promptRouter);

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
    server.listen(PORT, () => {
      console.log(`Connected to port ${PORT} sucessfully`);
    });
  });
};

setUpServer();

