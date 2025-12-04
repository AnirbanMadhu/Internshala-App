const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/channels', require('./routes/channelRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Track online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user joining
  socket.on('user:join', (data) => {
    const { userId, username } = data;
    socket.data.userId = userId;
    socket.data.username = username;

    onlineUsers.set(userId, {
      socketId: socket.id,
      username: username,
    });

    // Send list of online users to the new user
    let onlineUsersList = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
      userId,
      ...data,
    }));

    socket.emit('users:online', onlineUsersList);

    // Broadcast user online status to other users
    socket.broadcast.emit('user:online', {
      userId,
      username,
      socketId: socket.id,
    });

    console.log(`${username} joined (ID: ${userId})`);
  });

  // Handle joining a channel room
  socket.on('channel:join', (channelId) => {
    socket.join(`channel:${channelId}`);
    console.log(`User ${socket.data.username} joined channel ${channelId}`);
  });

  // Handle leaving a channel room
  socket.on('channel:leave', (channelId) => {
    socket.leave(`channel:${channelId}`);
    console.log(`User ${socket.data.username} left channel ${channelId}`);
  });

  // Handle new messages
  socket.on('message:send', (data) => {
    io.to(`channel:${data.channelId}`).emit('message:new', data);
  });

  // Handle message editing
  socket.on('message:edit', (data) => {
    io.to(`channel:${data.channelId}`).emit('message:edited', data);
  });

  // Handle message deletion
  socket.on('message:delete', (data) => {
    io.to(`channel:${data.channelId}`).emit('message:deleted', data);
  });

  // Handle typing indicators
  socket.on('typing:start', (data) => {
    socket.to(`channel:${data.channelId}`).emit('typing:start', data);
  });

  socket.on('typing:stop', (data) => {
    socket.to(`channel:${data.channelId}`).emit('typing:stop', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    if (socket.data.userId) {
      onlineUsers.delete(socket.data.userId);

      io.emit('user:offline', {
        userId: socket.data.userId,
        socketId: socket.id,
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server is ready`);
});
