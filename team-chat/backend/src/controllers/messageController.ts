import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Message, { IMessage } from '../models/Message';
import Channel, { IChannel } from '../models/Channel';
import { getFileType } from '../middleware/upload';
import mongoose from 'mongoose';

// @route   GET /api/messages?channelId=...&page=1&limit=50
// @desc    Get messages for a channel
// @access  Private
export const getMessages = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { channelId, page = 1, limit = 50 } = req.query;
    const userId: string = req.user!.userId;
    const username: string = req.user!.username;

    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }

    // Check if user has access to this channel
    const channel: IChannel | null = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.isPrivate && !channel.members.some((m: mongoose.Types.ObjectId) => m.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Auto-add user to public channel if not already a member
    const wasAdded: boolean = !channel.members.some((m: mongoose.Types.ObjectId) => m.toString() === userId);
    if (!channel.isPrivate && wasAdded) {
      channel.members.push(new mongoose.Types.ObjectId(userId));
      await channel.save();

      // Notify via global io instance if available
      if ((global as any).io) {
        const populatedChannel = await Channel.findById(channelId)
          .populate('createdBy', 'username')
          .populate('members', 'username email');
        (global as any).io.emit('channel:member-added', {
          channelId,
          userId,
          username,
          channel: populatedChannel
        });
      }
    }

    const skip: number = (Number(page) - 1) * Number(limit);

    const messages: IMessage[] = await Message.find({
      channelId,
      deleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total: number = await Message.countDocuments({
      channelId,
      deleted: false,
    });

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasMore: skip + messages.length < total,
      },
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
export const createMessage = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { channelId, content } = req.body;
    const { userId, username } = req.user!;

    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }

    if (!content && !req.file) {
      return res.status(400).json({ error: 'Message content or file is required' });
    }

    // Check if user has access to this channel
    const channel: IChannel | null = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.isPrivate && !channel.members.some((m: mongoose.Types.ObjectId) => m.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Auto-add user to public channel if not already a member
    const wasAdded: boolean = !channel.members.some((m: mongoose.Types.ObjectId) => m.toString() === userId);
    if (!channel.isPrivate && wasAdded) {
      channel.members.push(new mongoose.Types.ObjectId(userId));
      await channel.save();

      // Notify via global io instance if available
      if ((global as any).io) {
        const populatedChannel = await Channel.findById(channelId)
          .populate('createdBy', 'username')
          .populate('members', 'username email');
        (global as any).io.emit('channel:member-added', {
          channelId,
          userId,
          username,
          channel: populatedChannel
        });
      }
    }

    const messageData: Partial<IMessage> = {
      channelId: new mongoose.Types.ObjectId(channelId),
      userId: new mongoose.Types.ObjectId(userId),
      username,
      content: content || '',
    };

    // If file is uploaded, add file information
    if (req.file) {
      messageData.fileUrl = `/uploads/${req.file.filename}`;
      messageData.fileName = req.file.originalname;
      messageData.fileType = getFileType(req.file.mimetype);
      messageData.fileSize = req.file.size;
    }

    const message: IMessage = await Message.create(messageData);

    res.status(201).json({ message });
  } catch (error: any) {
    console.error('Create message error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   PATCH /api/messages/:id
// @desc    Edit a message
// @access  Private
export const updateMessage = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId: string = req.user!.userId;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const message: IMessage | null = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user owns this message
    if (message.userId.toString() !== userId) {
      return res.status(403).json({ error: 'You can only edit your own messages' });
    }

    if (message.deleted) {
      return res.status(400).json({ error: 'Cannot edit a deleted message' });
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    res.json({ message });
  } catch (error: any) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private
export const deleteMessage = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const userId: string = req.user!.userId;

    const message: IMessage | null = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user owns this message
    if (message.userId.toString() !== userId) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    // Soft delete
    message.deleted = true;
    message.content = '[Message deleted]';
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   GET /api/messages/search?channelId=...&query=...
// @desc    Search messages in a channel
// @access  Private
export const searchMessages = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  try {
    const { channelId, query, page = 1, limit = 50 } = req.query;
    const userId: string = req.user!.userId;
    const username: string = req.user!.username;

    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Check if user has access to this channel
    const channel: IChannel | null = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.isPrivate && !channel.members.some((m: mongoose.Types.ObjectId) => m.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Auto-add user to public channel if not already a member
    const wasAdded: boolean = !channel.members.some((m: mongoose.Types.ObjectId) => m.toString() === userId);
    if (!channel.isPrivate && wasAdded) {
      channel.members.push(new mongoose.Types.ObjectId(userId));
      await channel.save();

      // Notify via global io instance if available
      if ((global as any).io) {
        const populatedChannel = await Channel.findById(channelId)
          .populate('createdBy', 'username')
          .populate('members', 'username email');
        (global as any).io.emit('channel:member-added', {
          channelId,
          userId,
          username,
          channel: populatedChannel
        });
      }
    }

    const skip: number = (Number(page) - 1) * Number(limit);

    // Search messages using regex (case-insensitive)
    const messages: IMessage[] = await Message.find({
      channelId,
      deleted: false,
      content: { $regex: query, $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total: number = await Message.countDocuments({
      channelId,
      deleted: false,
      content: { $regex: query as string, $options: 'i' },
    });

    res.json({
      messages,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasMore: skip + messages.length < total,
      },
    });
  } catch (error: any) {
    console.error('Search messages error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
