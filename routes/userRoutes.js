const express = require('express');
const {
  getAllUsers,
  loginUser,
  registerUser,
} = require('../controllers/user/userController.js');

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;

