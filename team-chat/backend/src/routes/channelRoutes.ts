import express from 'express';
import * as channelController from '../controllers/channelController';
import authMiddleware from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', channelController.getChannels);
router.post('/', channelController.createChannel);
router.get('/:id', channelController.getChannel);
router.post('/:id/join', channelController.joinChannel);
router.post('/:id/leave', channelController.leaveChannel);

export default router;
