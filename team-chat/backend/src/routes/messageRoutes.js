const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(authMiddleware);

router.get('/', messageController.getMessages);
router.post('/', upload.single('file'), messageController.createMessage);
router.get('/search', messageController.searchMessages);
router.patch('/:id', messageController.updateMessage);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
