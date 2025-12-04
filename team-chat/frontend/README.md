# Team Chat Frontend

Next.js + React + TypeScript frontend for the Team Chat application with real-time messaging powered by Socket.io.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io Client
- **Date Handling**: date-fns

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── chat/              # Main chat interface
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects)
├── components/            # React components
│   ├── auth/             # Authentication components
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── chat/             # Chat components
│   │   ├── Sidebar.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   ├── CreateChannelModal.tsx
│   │   └── SearchMessages.tsx
│   └── ui/               # Reusable UI components
│       ├── Button.tsx
│       └── Input.tsx
├── contexts/             # React Context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── SocketContext.tsx # Socket.io connection
├── types/                # TypeScript type definitions
│   └── index.ts
├── public/               # Static assets
├── package.json
├── .env
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend server running (see backend/README.md)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

   For production:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-api.com
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to http://localhost:3000

## Features

### Core Features
- ✅ User authentication (signup/login)
- ✅ Real-time messaging
- ✅ Multiple channels
- ✅ Online presence indicators
- ✅ Message history with pagination
- ✅ Persistent sessions

### Advanced Features
- ✅ Private channels
- ✅ Typing indicators
- ✅ Message editing
- ✅ Message deletion
- ✅ Message search
- ✅ Infinite scroll for messages

## Components Overview

### Authentication

**LoginForm** (`components/auth/LoginForm.tsx`)
- Email and password input
- Form validation
- Error handling
- Redirects to chat on success

**SignupForm** (`components/auth/SignupForm.tsx`)
- Username, email, password fields
- Password confirmation
- Client-side validation
- Redirects to chat on success

### Chat Interface

**Sidebar** (`components/chat/Sidebar.tsx`)
- Channel list
- Online users list
- Create channel button
- User info and logout
- Connection status indicator

**MessageList** (`components/chat/MessageList.tsx`)
- Message display with infinite scroll
- Load more messages (pagination)
- Edit/delete buttons for own messages
- Timestamp formatting
- "Edited" indicator

**MessageInput** (`components/chat/MessageInput.tsx`)
- Text input for new messages
- Send button
- Typing indicator integration
- Auto-focus and keyboard shortcuts

**CreateChannelModal** (`components/chat/CreateChannelModal.tsx`)
- Modal dialog for creating channels
- Channel name and description inputs
- Private channel toggle
- Form validation

**SearchMessages** (`components/chat/SearchMessages.tsx`)
- Search input
- Results display
- Full-text search across messages

## State Management

### Auth Context

Manages authentication state:
- Current user
- JWT token (stored in localStorage)
- Login/logout functions
- Token refresh

### Socket Context

Manages WebSocket connection:
- Socket.io client instance
- Connection status
- Online users list
- Typing indicators
- Real-time event handlers

## API Integration

All API calls go through the backend server:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Example API call with auth
const response = await fetch(`${API_URL}/api/channels`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  credentials: 'include',
});
```

## Styling

The app uses Tailwind CSS for styling with a custom color scheme:

- **Primary**: Blue (messages, buttons)
- **Sidebar**: Dark gray (#1F2937)
- **Background**: Light gray (#F9FAFB)
- **Text**: Gray scale

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Sidebar collapses on mobile (future enhancement)

## Real-time Features

### Socket.io Integration

```typescript
// Connect to socket server
const socket = io(SOCKET_URL);

// Join user session
socket.emit('user:join', { userId, username });

// Listen for new messages
socket.on('message:new', (message) => {
  // Update UI
});

// Send typing indicator
socket.emit('typing:start', { channelId, userId, username });
```

## TypeScript Types

Key type definitions:

```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: Date;
  isOnline?: boolean;
}

interface Channel {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  members: string[];
  createdBy: string;
  createdAt: Date;
}

interface Message {
  _id: string;
  channelId: string;
  userId: string;
  username: string;
  content: string;
  edited?: boolean;
  editedAt?: Date;
  createdAt: Date;
}
```

## Build & Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SOCKET_URL`
4. Deploy!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy the `.next` folder
3. Configure environment variables

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Message pagination (50 messages per page)
- Infinite scroll for message history
- Debounced typing indicators
- Optimistic UI updates
- React component memoization
- Image lazy loading (future enhancement)

## Troubleshooting

### Can't connect to backend
- Check `.env` has correct API URL
- Verify backend server is running
- Check CORS settings on backend

### Socket.io not connecting
- Ensure Socket URL matches backend
- Check browser console for errors
- Verify firewall/network settings

### TypeScript errors
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` configuration

## License

MIT

---

Built with Next.js, React, TypeScript, and Tailwind CSS
