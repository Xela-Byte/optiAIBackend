const { errorHandling } = require('../../middlewares/errorHandling');
const { Prompt } = require('../../models/Prompt');

exports.getAllPrompts = async (req, res, next) => {
  let prompts;

  try {
    prompts = await Prompt.find();
    if (!prompts) errorHandling(`404|No prompts found!|`);
    res.status(200).json({
      message: 'Success',
      prompts,
    });
  } catch (e) {
    next(new Error(e.stack));
  }
};

exports.addNewPrompt = async (req, res, next) => {
  const { promptValue, errorMessage } = req.body;
  const user = req.user;

  try {
    if (!user) errorHandling(`400|User not found.|`);
    if (!promptValue) errorHandling(`400|Please provide prompt value.|`);
    if (!errorMessage) errorHandling(`400|Please provide error message.|`);
    if (user.role !== 'admin')
      errorHandling(`401|Not authorized to add a prompt.|`);

    const existingPrompt = await Prompt.findOne({ value: promptValue });

    if (existingPrompt) {
      errorHandling(`401|Prompt already exists.|`);
    } else {
      const newPrompt = new Prompt({
        value: promptValue,
        errorMessage,
        addedBy: user._id,
      });

      await newPrompt.save();

      res.status(200).json({
        message: 'Success',
        response: newPrompt,
      });
    }
  } catch (e) {
    next(new Error(e.stack));
  }
};

exports.updatePrompt = async (req, res, next) => {
  try {
    const user = req.user;
    const { promptValue, errorMessage, promptId, active } = req.body;

    if (!user) errorHandling(`400|User not found.|`);
    if (!promptId) errorHandling(`400|Prompt not found.|`);
    if (user.role !== 'admin')
      errorHandling(`401|Not authorized to update a prompt.|`);
    else {
      await Prompt.findOneAndUpdate(
        { _id: promptId },
        {
          value: promptValue,
          errorMessage,
          active,
        },
      );

      const updatedPrompt = await Prompt.findOne({ _id: promptId });

      res.status(200).json({
        statusCode: 200,
        message: 'Prompt updated successfully.',
        data: updatedPrompt,
      });
    }
  } catch (e) {
    next(new Error(e.stack));
  }
};

exports.deletePrompt = async (req, res, next) => {
  try {
    const user = req.user;
    const promptId = req.query.promptId;

    if (!user) errorHandling(`400|User not found.|`);
    if (!promptId) errorHandling(`400|Prompt ID not found.|`);
    if (user.role !== 'admin')
      errorHandling(`401|Not authorized to delete a prompt.|`);
    else {
      const existingPrompt = await Prompt.findOne({ _id: promptId });

      if (!existingPrompt) errorHandling(`400|Prompt not found.|`);
      else {
        const deletedPrompt = await Prompt.deleteOne({ _id: promptId });
        res.status(200).json({
          statusCode: 200,
          message: 'Prompt deleted successfully.',
          data: existingPrompt,
        });
      }
    }
  } catch (e) {
    next(new Error(e.stack));
  }
};

