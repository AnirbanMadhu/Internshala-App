const Message = require('../models/Message');
const Channel = require('../models/Channel');

// @route   GET /api/messages?channelId=...&page=1&limit=50
// @desc    Get messages for a channel
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { channelId, page = 1, limit = 50 } = req.query;
    const userId = req.user.userId;

    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }

    // Check if user has access to this channel
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.isPrivate && !channel.members.some(m => m.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      channelId,
      deleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      channelId,
      deleted: false,
    });

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + messages.length < total,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
exports.createMessage = async (req, res) => {
  try {
    const { channelId, content } = req.body;
    const { userId, username } = req.user;

    if (!channelId || !content) {
      return res.status(400).json({ error: 'Channel ID and content are required' });
    }

    // Check if user has access to this channel
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.isPrivate && !channel.members.some(m => m.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await Message.create({
      channelId,
      userId,
      username,
      content,
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   PATCH /api/messages/:id
// @desc    Edit a message
// @access  Private
exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const message = await Message.findById(id);

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
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(id);

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
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// @route   GET /api/messages/search?channelId=...&query=...
// @desc    Search messages in a channel
// @access  Private
exports.searchMessages = async (req, res) => {
  try {
    const { channelId, query, page = 1, limit = 50 } = req.query;
    const userId = req.user.userId;

    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Check if user has access to this channel
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.isPrivate && !channel.members.some(m => m.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const skip = (page - 1) * limit;

    // Search messages using regex (case-insensitive)
    const messages = await Message.find({
      channelId,
      deleted: false,
      content: { $regex: query, $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      channelId,
      deleted: false,
      content: { $regex: query, $options: 'i' },
    });

    res.json({
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + messages.length < total,
      },
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
