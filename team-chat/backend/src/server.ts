import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import channelRoutes from './routes/channelRoutes';
import messageRoutes from './routes/messageRoutes';

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Make io available globally for controllers
(global as any).io = io;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Track online users
interface OnlineUser {
  socketId: string;
  username: string;
}

const onlineUsers = new Map<string, OnlineUser>();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user joining
  socket.on('user:join', (data: { userId: string; username: string }) => {
    const { userId, username } = data;
    socket.data.userId = userId;
    socket.data.username = username;

    onlineUsers.set(userId, {
      socketId: socket.id,
      username: username,
    });

    // Send list of online users to the new user
    const onlineUsersList = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
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
  socket.on('channel:join', (channelId: string) => {
    socket.join(`channel:${channelId}`);
    console.log(`User ${socket.data.username} joined channel ${channelId}`);
  });

  // Handle leaving a channel room
  socket.on('channel:leave', (channelId: string) => {
    socket.leave(`channel:${channelId}`);
    console.log(`User ${socket.data.username} left channel ${channelId}`);
  });

  // Handle new messages
  socket.on('message:send', (data: any) => {
    io.to(`channel:${data.channelId}`).emit('message:new', data);
  });

  // Handle message editing
  socket.on('message:edit', (data: any) => {
    io.to(`channel:${data.channelId}`).emit('message:edited', data);
  });

  // Handle message deletion
  socket.on('message:delete', (data: any) => {
    io.to(`channel:${data.channelId}`).emit('message:deleted', data);
  });

  // Handle typing indicators
  socket.on('typing:start', (data: any) => {
    socket.to(`channel:${data.channelId}`).emit('typing:start', data);
  });

  socket.on('typing:stop', (data: any) => {
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
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server is ready`);
});
