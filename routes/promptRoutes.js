const express = require('express');
const {
  addNewPrompt,
  getAllPrompts,
  updatePrompt,
  deletePrompt,
} = require('../controllers/prompt/promptController');
const { verifyToken } = require('../core/verifyToken');

const promptRouter = express.Router();

promptRouter.get('/get-all-prompts', getAllPrompts);
promptRouter.post('/add-prompt', verifyToken, addNewPrompt);
promptRouter.patch('/update-prompt', verifyToken, updatePrompt);
promptRouter.delete('/delete-prompt', verifyToken, deletePrompt);

module.exports = promptRouter;

