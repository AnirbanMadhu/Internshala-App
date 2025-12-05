# Team Chat App

A real-time chat application built with Next.js and Node.js. Supports multiple channels, real-time messaging, and online presence tracking.

## Architecture

The app is split into two parts:

- **Frontend**: Next.js with React and TypeScript
- **Backend**: Node.js + Express + MongoDB
- Real-time features use Socket.io

```
┌─────────────────┐         HTTP/REST          ┌─────────────────┐
│                 │ ◄────── API Calls ────────► │                 │
│  Next.js        │                             │  Express.js     │
│  Frontend       │ ◄───── WebSocket ─────────► │  Backend        │
│  (Port 3000)    │      (Socket.io)            │  (Port 5000)    │
│                 │                             │                 │
└─────────────────┘                             └────────┬────────┘
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │   MongoDB   │
                                                  │  Database   │
                                                  └─────────────┘
```

## ✨ Features

### Core Features
- ✅ **User Authentication** - Secure signup and login with JWT
- ✅ **Real-time Messaging** - Instant message delivery using Socket.io
- ✅ **Multiple Channels** - Create, join, and leave channels
- ✅ **Online Presence** - See who's currently online
- ✅ **Message History** - Load and display message history with pagination
- ✅ **Persistent Sessions** - Stay logged in across page refreshes

### Bonus Features
- ✅ **Private Channels** - Create invite-only channels
- ✅ **Typing Indicators** - See when others are typing
- ✅ **Message Editing** - Edit your own messages
- ✅ **Message Deletion** - Delete messages you've sent
- ✅ **Message Search** - Full-text search through channel messages

## 📁 Project Structure

```
team-chat/
├── backend/              # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Authentication middleware
│   │   ├── config/       # Database configuration
│   │   └── server.js     # Main server + Socket.io
│   ├── package.json
│   └── .env
│
├── frontend/             # Next.js Frontend
│   ├── app/              # Next.js pages (no API routes)
│   ├── components/       # React components
│   ├── contexts/         # React Context (Auth, Socket)
│   ├── types/            # TypeScript types
│   ├── package.json
│   └── .env
│
└── README.md (this file)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation & Running

You need to run **both** backend and frontend servers:

#### 1️⃣ Start Backend Server

```bash
cd backend
npm install
```

Configure backend environment variables (`.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-chat
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

Backend runs on: http://localhost:5000

#### 2️⃣ Start Frontend Server

```bash
cd frontend
npm install
```

Configure frontend environment variables (`.env`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

Frontend runs on: http://localhost:3000

#### 3️⃣ Access the Application

Open your browser and navigate to: http://localhost:3000

## 🗄️ Database Setup

### Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   mongod
   ```
3. Use connection string: `mongodb://localhost:27017/team-chat`

### Option 2: MongoDB Atlas (Recommended for Production)

1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Create database user
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/team-chat?retryWrites=true&w=majority
   ```
6. Update `MONGODB_URI` in backend `.env`

## 📡 API Endpoints

All API endpoints are prefixed with `/api`:

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (requires auth)

### Channels
- `GET /api/channels` - List all accessible channels
- `POST /api/channels` - Create new channel
- `GET /api/channels/:id` - Get channel details
- `POST /api/channels/:id/join` - Join channel
- `POST /api/channels/:id/leave` - Leave channel

### Messages
- `GET /api/messages?channelId=...&page=1` - Get messages (paginated)
- `POST /api/messages` - Send message
- `PATCH /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `GET /api/messages/search?channelId=...&query=...` - Search messages

All protected endpoints require `Authorization: Bearer <token>` header.

## 🔌 Socket.io Events

### Client → Server
- `user:join` - User connects
- `channel:join` - Join channel room
- `channel:leave` - Leave channel room
- `message:send` - Send message
- `message:edit` - Edit message
- `message:delete` - Delete message
- `typing:start` - Start typing
- `typing:stop` - Stop typing

### Server → Client
- `users:online` - Online users list
- `user:online` - User came online
- `user:offline` - User went offline
- `message:new` - New message
- `message:edited` - Message edited
- `message:deleted` - Message deleted
- `typing:start` - User typing
- `typing:stop` - User stopped typing

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.io
- **Security**: CORS, helmet

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io Client
- **Date**: date-fns

## 🔒 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for stateless authentication
- Tokens stored in localStorage + httpOnly cookies
- CORS enabled with specific origins
- Input validation and sanitization
- MongoDB injection prevention
- XSS protection

## 📦 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Push backend code to GitHub
2. Create new service on hosting platform
3. Set environment variables:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET` (strong random string)
   - `CLIENT_URL` (your frontend URL)
   - `NODE_ENV=production`
4. Deploy!

### Frontend Deployment (Vercel)

1. Push frontend code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Set environment variables:
   - `NEXT_PUBLIC_API_URL` (backend URL)
   - `NEXT_PUBLIC_SOCKET_URL` (backend URL)
5. Deploy!

## 🎯 Development Workflow

1. Make changes to backend code → Test on http://localhost:5000
2. Make changes to frontend code → Test on http://localhost:3000
3. Frontend calls backend API automatically
4. Socket.io handles real-time updates

## 🐛 Troubleshooting

### Backend not connecting to MongoDB
- Check MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check network/firewall settings

### Frontend can't reach backend
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env`
- Verify CORS settings in backend

### Socket.io connection issues
- Check `NEXT_PUBLIC_SOCKET_URL` matches backend
- Verify Socket.io is running (check backend console)
- Check browser console for errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License

## 👥 Support

For issues or questions, open an issue on GitHub

---

**Built with ❤️ using Node.js, Express, MongoDB, Next.js, React, and Socket.io**
