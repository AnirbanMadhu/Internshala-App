const Channel = require('../models/Channel');
const mongoose = require('mongoose');

// @route   GET /api/channels
// @desc    Get all channels user can access
// @access  Private
exports.getChannels = async (req, res) => {
  try {
    const userId = req.user.userId;

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
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   POST /api/channels
// @desc    Create new channel
// @access  Private
exports.createChannel = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    const userId = req.user.userId;

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

    res.status(201).json({ channel: populatedChannel });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   GET /api/channels/:id
// @desc    Get channel details
// @access  Private
exports.getChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const channel = await Channel.findById(id)
      .populate('createdBy', 'username')
      .populate('members', 'username email');

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user has access to this channel
    if (channel.isPrivate && !channel.members.some(m => m._id.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ channel });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   POST /api/channels/:id/join
// @desc    Join a channel
// @access  Private
exports.joinChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user is already a member
    if (channel.members.includes(userId)) {
      return res.status(400).json({ error: 'Already a member of this channel' });
    }

    channel.members.push(userId);
    await channel.save();

    const updatedChannel = await Channel.findById(id)
      .populate('createdBy', 'username')
      .populate('members', 'username');

    res.json({ channel: updatedChannel });
  } catch (error) {
    console.error('Join channel error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   POST /api/channels/:id/leave
// @desc    Leave a channel
// @access  Private
exports.leaveChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user is a member
    const memberIndex = channel.members.findIndex(m => m.toString() === userId);

    if (memberIndex === -1) {
      return res.status(400).json({ error: 'Not a member of this channel' });
    }

    // Don't allow creator to leave if they're the only member
    if (channel.createdBy.toString() === userId && channel.members.length === 1) {
      return res.status(400).json({
        error: 'Cannot leave channel as the creator. Delete the channel instead.'
      });
    }

    channel.members.splice(memberIndex, 1);
    await channel.save();

    res.json({ message: 'Left channel successfully' });
  } catch (error) {
    console.error('Leave channel error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
