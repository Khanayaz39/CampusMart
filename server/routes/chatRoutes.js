const express = require('express');
const router = express.Router();
const { 
  getConversations, 
  getMessages, 
  sendMessage, 
  startConversation,
  getUnreadCount,
  markAsRead,
  deleteConversation
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { moderateChatMessageMiddleware } = require('../middleware/contentModeration');

router.use(protect); // All chat routes require authentication

router.post('/start', startConversation);
router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.post('/message', moderateChatMessageMiddleware, sendMessage);
router.put('/:chatId/read', markAsRead);
router.get('/:chatId', getMessages);
router.delete('/:chatId', deleteConversation);

module.exports = router;
