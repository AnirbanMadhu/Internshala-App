const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', channelController.getChannels);
router.post('/', channelController.createChannel);
router.get('/:id', channelController.getChannel);
router.post('/:id/join', channelController.joinChannel);
router.post('/:id/leave', channelController.leaveChannel);

module.exports = router;
