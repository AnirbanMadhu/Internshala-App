const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', messageController.getMessages);
router.post('/', messageController.createMessage);
router.get('/search', messageController.searchMessages);
router.patch('/:id', messageController.updateMessage);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
