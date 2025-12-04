# Team Chat Backend API

Node.js + Express + MongoDB backend server for the Team Chat application with Socket.io for real-time communication.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Security**: bcryptjs, CORS

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   ├── channelController.js
│   │   └── messageController.js
│   ├── models/           # MongoDB schemas
│   │   ├── User.js
│   │   ├── Channel.js
│   │   └── Message.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── channelRoutes.js
│   │   └── messageRoutes.js
│   ├── middleware/       # Custom middleware
│   │   └── auth.js
│   ├── config/          # Configuration files
│   │   └── database.js
│   └── server.js        # Main application entry
├── package.json
├── .env
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/team-chat
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

   For MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/team-chat?retryWrites=true&w=majority
   ```

4. **Start the server**

   Development mode (with nodemon):
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

5. **Verify server is running**

   Visit http://localhost:5000/health - should return:
   ```json
   {
     "status": "OK",
     "message": "Server is running"
   }
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Channels

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/channels` | Get all accessible channels | Yes |
| POST | `/api/channels` | Create new channel | Yes |
| GET | `/api/channels/:id` | Get channel details | Yes |
| POST | `/api/channels/:id/join` | Join a channel | Yes |
| POST | `/api/channels/:id/leave` | Leave a channel | Yes |

### Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages?channelId=...&page=1&limit=50` | Get messages (paginated) | Yes |
| POST | `/api/messages` | Send a message | Yes |
| PATCH | `/api/messages/:id` | Edit a message | Yes |
| DELETE | `/api/messages/:id` | Delete a message | Yes |
| GET | `/api/messages/search?channelId=...&query=...` | Search messages | Yes |

## Socket.io Events

### Client → Server

- `user:join` - User connects with credentials
- `channel:join` - Join channel room
- `channel:leave` - Leave channel room
- `message:send` - Broadcast new message
- `message:edit` - Broadcast edited message
- `message:delete` - Broadcast deleted message
- `typing:start` - User starts typing
- `typing:stop` - User stops typing

### Server → Client

- `users:online` - List of online users
- `user:online` - User came online
- `user:offline` - User went offline
- `message:new` - New message received
- `message:edited` - Message was edited
- `message:deleted` - Message was deleted
- `typing:start` - User started typing
- `typing:stop` - User stopped typing

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User signs up or logs in
2. Server returns a JWT token
3. Client includes token in `Authorization` header: `Bearer <token>`
4. Token is also stored in httpOnly cookie for browser security

## Database Models

### User Schema
```javascript
{
  username: String (unique, 3-30 chars),
  email: String (unique, valid email),
  password: String (hashed, min 6 chars),
  createdAt: Date
}
```

### Channel Schema
```javascript
{
  name: String (unique, 2-50 chars),
  description: String (max 200 chars),
  isPrivate: Boolean,
  members: [ObjectId] (ref: User),
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

### Message Schema
```javascript
{
  channelId: ObjectId (ref: Channel),
  userId: ObjectId (ref: User),
  username: String,
  content: String (max 2000 chars),
  edited: Boolean,
  editedAt: Date,
  deleted: Boolean,
  createdAt: Date
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Testing with cURL

**Sign up:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get channels (with auth):**
```bash
curl http://localhost:5000/api/channels \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Deployment

### Deploy to Render/Railway/Heroku

1. Push code to GitHub
2. Connect your repository to the hosting platform
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `NODE_ENV=production`
4. Deploy!

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for stateless authentication
- CORS enabled with specific origin
- httpOnly cookies to prevent XSS
- Request validation and sanitization
- MongoDB injection prevention via Mongoose

## License

MIT

---

Built with Node.js, Express, MongoDB, and Socket.io
