# Team Chat App

A simple real-time chat app with channels, built using Next.js and Node.js.

## Features

- User signup/login
- Create and join channels
- Real-time messaging with Socket.io
- Message history

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB (with Mongoose), Socket.io, JWT Authentication, bcrypt for password hashing, multer for file uploads
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Socket.io-client, Framer Motion for animations, Lucide React for icons, React Hot Toast for notifications, date-fns for date formatting

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local installation or MongoDB Atlas)

### Setup and Run Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd team-chat
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file in the backend directory with the following variables:
   # PORT=5000
   # MONGODB_URI=mongodb://localhost:27017/team-chat (or your MongoDB Atlas URI)
   # JWT_SECRET=your-secret-key-here
   # CLIENT_URL=http://localhost:3000
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   # Create a .env.local file in the frontend directory with the following variables:
   # NEXT_PUBLIC_API_URL=http://localhost:5000
   # NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to access the application.

## Assumptions and Limitations

- **Database**: Assumes MongoDB is running locally or accessible via MongoDB Atlas. The application uses Mongoose for schema definition and data validation.
- **Authentication**: JWT tokens are stored in HTTP-only cookies for security. Assumes a secure connection (HTTPS) in production.
- **File Uploads**: Supports image uploads via multer, but file size and type validation is basic. Large files may cause performance issues.
- **Real-time Features**: Socket.io is used for real-time messaging, assuming a stable network connection. Disconnections may result in missed messages.
- **Limitations**: 
  - No end-to-end encryption for messages.
  - Message history is limited to the database storage; no pagination implemented for large message volumes.
  - User presence is tracked via Socket.io connections, which may not be perfectly accurate.
  - No rate limiting implemented for API endpoints.

## Optional Features Implemented

- Online user presence
- Private channels
- Typing indicators
- Message editing/deletion
- Message search

## API Endpoints

- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/channels` - Get channels
- `POST /api/channels` - Create channel
- `GET /api/messages?channelId=X` - Get messages
- `POST /api/messages` - Send message

## Deployment

- Backend: Deploy to Render with MongoDB Atlas
- Frontend: Deploy in Render

Set environment variables accordingly.

## Deployed Application Links

- **Live Frontend URL**: https://team-chat-frontend.onrender.com
- **Backend Base URL**: https://internshala-app-2xt0.onrender.com
