const { User } = require('../../models/User');
const { updateToken } = require('../../core/updateToken');
const jwt = require('jsonwebtoken');
const { errorHandling } = require('../../middlewares/errorHandling');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find();
  } catch (err) {
    console.log(err);
  }
  if (!users) {
    res.status(404).json({ message: 'No users found!' });
  }
  return res.status(200).json({ users });
};

exports.registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password)
      errorHandling(`400|Please provide all fields.|`);
    else {
      const existingUser = await User.findOne({
        email: email,
      });
      if (existingUser)
        errorHandling(`401|User with email, ${email} already exists.|`);
      else {
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
          username: username,
          email: email,
          password: hashedPassword,
        });
        await newUser.save();
        const token = jwt.sign(
          {
            _id: newUser._id,
          },
          process.env.TOKEN,
          {
            expiresIn: '7d',
          },
        );
        await updateToken(newUser._id, token);

        const createdUser = await User.findOne({
          email: email,
        }).select('-password');

        res.status(200).json({
          message: 'Success',
          token: token,
          response: createdUser,
        });
      }
    }
  } catch (e) {
    next(new Error(e.stack));
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!password || !email) {
      res.status(400).json({
        message: 'Please fill all fields',
      });
    } else {
      const existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        res.status(401).json({
          message: 'User does not exist',
        });
      } else {
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
          res.status(401).json({
            message: 'Incorrect password',
          });
        } else {
          const token = jwt.sign(
            { email: existingUser.email, _id: existingUser._id },
            process.env.TOKEN,
            {
              expiresIn: '7d',
            },
          );
          await updateToken(existingUser._id, token);
          res.status(200).json({
            message: 'Login Successful',
            token: token,
            response: existingUser,
          });
        }
      }
    }
  } catch (e) {
    res.status(500).json({
      message: 'Internal server error, please try again later!',
    });
  }
};

