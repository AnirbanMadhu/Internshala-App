import express from 'express';
import * as messageController from '../controllers/messageController';
import authMiddleware from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.use(authMiddleware);

router.get('/', messageController.getMessages);
router.post('/', upload.single('file'), messageController.createMessage);
router.get('/search', messageController.searchMessages);
router.patch('/:id', messageController.updateMessage);
router.delete('/:id', messageController.deleteMessage);

export default router;
