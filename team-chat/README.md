# Team Chat App

A simple real-time chat app with channels, built using Next.js and Node.js.

## Features

- User signup/login
- Create and join channels
- Real-time messaging with Socket.io
- Online user presence
- Message history
- Private channels
- Typing indicators
- Message editing/deletion
- Message search

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. **Backend**:
   ```bash
   cd backend
   npm install
   # Create .env file with:
   # PORT=5000
   # MONGODB_URI=mongodb://localhost:27017/team-chat
   # JWT_SECRET=your-secret-key
   # CLIENT_URL=http://localhost:3000
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   # Create .env.local with:
   # NEXT_PUBLIC_API_URL=http://localhost:5000
   # NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   npm run dev
   ```

3. Open http://localhost:3000

## API Endpoints

- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/channels` - Get channels
- `POST /api/channels` - Create channel
- `GET /api/messages?channelId=X` - Get messages
- `POST /api/messages` - Send message

## Deployment

- Backend: Deploy to Render/Heroku with MongoDB Atlas
- Frontend: Deploy to Vercel

Set environment variables accordingly.
