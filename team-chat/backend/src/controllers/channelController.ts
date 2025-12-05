import { Response } from 'express';
import Channel from '../models/Channel';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';

// @route   GET /api/channels
// @desc    Get all channels user can access
// @access  Private
export const getChannels = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const userId = req.user?.userId;

    // Get all public channels and private channels where user is a member
    const channels = await Channel.find({
      $or: [
        { isPrivate: false },
        { isPrivate: true, members: userId }
      ]
    })
    .populate('createdBy', 'username')
    .populate('members', 'username')
    .sort({ createdAt: -1 });

    res.json({ channels });
  } catch (error: any) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   POST /api/channels
// @desc    Create new channel
// @access  Private
export const createChannel = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { name, description, isPrivate } = req.body;
    const userId = req.user?.userId;

    if (!name) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    // Check if channel name already exists
    const existingChannel = await Channel.findOne({ name });

    if (existingChannel) {
      return res.status(400).json({ error: 'Channel name already exists' });
    }

    const channel = await Channel.create({
      name,
      description,
      isPrivate: isPrivate || false,
      members: [new mongoose.Types.ObjectId(userId)],
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    const populatedChannel = await Channel.findById(channel._id)
      .populate('createdBy', 'username')
      .populate('members', 'username');

    // Broadcast new channel to all connected users
    if ((global as any).io) {
      (global as any).io.emit('channel:created', { channel: populatedChannel });
    }

    res.status(201).json({ channel: populatedChannel });
  } catch (error: any) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   GET /api/channels/:id
// @desc    Get channel details
// @access  Private
export const getChannel = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const channel = await Channel.findById(id)
      .populate('createdBy', 'username')
      .populate('members', 'username email');

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user has access to this channel
    if (channel.isPrivate && !channel.members.some((m: any) => m._id.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ channel });
  } catch (error: any) {
    console.error('Get channel error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   POST /api/channels/:id/join
// @desc    Join a channel
// @access  Private
export const joinChannel = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user is already a member
    if (channel.members.includes(userId as any)) {
      return res.status(400).json({ error: 'Already a member of this channel' });
    }

    channel.members.push(userId as any);
    await channel.save();

    const updatedChannel = await Channel.findById(id)
      .populate('createdBy', 'username')
      .populate('members', 'username');

    // Broadcast channel update to all users
    if ((global as any).io) {
      (global as any).io.emit('channel:updated', { channel: updatedChannel });
      // Notify the channel that user joined
      (global as any).io.to(`channel:${id}`).emit('user:joined-channel', {
        userId,
        channelId: id,
        username: req.user?.username
      });
    }

    res.json({ channel: updatedChannel });
  } catch (error: any) {
    console.error('Join channel error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   POST /api/channels/:id/leave
// @desc    Leave a channel
// @access  Private
export const leaveChannel = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user is a member
    const memberIndex = channel.members.findIndex((m: any) => m.toString() === userId);

    if (memberIndex === -1) {
      return res.status(400).json({ error: 'Not a member of this channel' });
    }

    // Don't allow creator to leave if they're the only member
    if ((channel.createdBy as any).toString() === userId && channel.members.length === 1) {
      return res.status(400).json({
        error: 'Cannot leave channel as the creator. Delete the channel instead.'
      });
    }

    channel.members.splice(memberIndex, 1);
    await channel.save();

    // Broadcast channel update to all users
    const updatedChannel = await Channel.findById(id)
      .populate('createdBy', 'username')
      .populate('members', 'username');

    if ((global as any).io) {
      (global as any).io.emit('channel:updated', { channel: updatedChannel });
      // Notify the channel that user left
      (global as any).io.to(`channel:${id}`).emit('user:left-channel', {
        userId,
        channelId: id,
        username: req.user?.username
      });
    }

    res.json({ message: 'Left channel successfully' });
  } catch (error: any) {
    console.error('Leave channel error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
