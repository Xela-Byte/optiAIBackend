const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { Error } = require('mongoose');
require('dotenv').config();

exports.verifyToken = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization ||
      req.body.token ||
      req.params.token ||
      req.query.token;
    if (!token) {
      res.status(401).json({
        message: 'Token not found! Did you login?',
      });
    } else {
      await jwt.verify(token, process.env.TOKEN, async function (err, decoded) {
        const key = decoded._id;
        const user = await User.findById(key);
        if (!user) {
          res.status(401).json({
            message: 'User not found',
          });
        }
        req.user = user;
      });
      next();
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: 'Please login again!',
    });
  }
};

exports.updateToken = async (id, key) => {
  try {
    await User.findByIdAndUpdate(id, {
      token: key,
    });
    return true;
  } catch (e) {
    Error(e.stack);
  }
};

