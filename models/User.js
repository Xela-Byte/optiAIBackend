const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      default: 'user',
    },
    customer: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    subscription: {
      active: {
        type: Boolean,
        default: false,
      },
      subscriptionId: {
        type: String,
        unique: true,
        index: true,
        sparse: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema);
module.exports = {
  User: User,
};

