const User = require("../models/User");

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
