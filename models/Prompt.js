const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promptSchema = new Schema(
  {
    value: {
      type: String,
      required: true,
    },
    errorMessage: {
      type: String,
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

const Prompt = mongoose.model('Prompt', promptSchema);
module.exports = {
  Prompt: Prompt,
};

