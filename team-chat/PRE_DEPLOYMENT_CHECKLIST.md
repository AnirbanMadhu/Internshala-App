# Pre-Deployment Checklist

Use this checklist to ensure your Team Chat Application is ready for deployment.

## ✅ Local Development Testing

### Backend Testing
- [ ] Navigate to `cd team-chat/backend`
- [ ] Install dependencies: `npm install`
- [ ] Start backend: `npm run dev`
- [ ] Verify backend runs on http://localhost:5000
- [ ] Test health endpoint: Visit http://localhost:5000/health
- [ ] Verify MongoDB connection in console logs
- [ ] Stop backend: `Ctrl+C`

### Frontend Testing
- [ ] Navigate to `cd team-chat/frontend`
- [ ] Install dependencies: `npm install`
- [ ] Start frontend: `npm run dev`
- [ ] Verify frontend runs on http://localhost:3000
- [ ] Check for console errors (F12 > Console)
- [ ] Verify Socket.io connection (should see "Socket connected" in console)

### Feature Testing
- [ ] **Sign Up**: Create a new account
  - Enter username, email, password
  - Verify redirect to chat page

- [ ] **Login**: Log out and log back in
  - Verify session persists on page refresh

- [ ] **Create Channel**: Click "+" button
  - Create a public channel
  - Create a private channel
  - Verify channels appear in sidebar

- [ ] **Send Messages**: Select a channel
  - Type and send a message
  - Verify message appears instantly
  - Try sending an emoji

- [ ] **Real-time Testing**: Open in second browser/tab
  - Send message from one browser
  - Verify it appears in the other browser instantly
  - Check online status indicators

- [ ] **Typing Indicators**: Start typing
  - Verify "User is typing..." appears in other browser

- [ ] **Message Actions**: Hover over your message
  - Edit a message
  - Delete a message
  - Verify changes appear in both browsers

- [ ] **Search**: Click search button
  - Search for a keyword
  - Verify results appear

- [ ] **Pagination**: Scroll up in message list
  - Click "Load More"
  - Verify older messages load

- [ ] **Channel Actions**:
  - Join a public channel
  - Leave a channel
  - Check members sidebar

- [ ] **Mobile Responsiveness**:
  - Resize browser to mobile width (< 768px)
  - Verify hamburger menu appears
  - Test all features on mobile view

## ✅ Code Quality

### Backend
- [ ] Run build: `cd backend && npm run build`
- [ ] Verify no TypeScript errors
- [ ] Check `.env` file has all required variables:
  - `PORT=5000`
  - `MONGODB_URI` (your MongoDB Atlas connection)
  - `JWT_SECRET` (cryptographically secure)
  - `CLIENT_URL=http://localhost:3000`
  - `NODE_ENV=development`

### Frontend
- [ ] Run build: `cd frontend && npm run build`
- [ ] Verify successful compilation
- [ ] Verify no warnings (should see "✓ Compiled successfully")
- [ ] Check `.env` file has all required variables:
  - `NEXT_PUBLIC_API_URL=http://localhost:5000`
  - `NEXT_PUBLIC_SOCKET_URL=http://localhost:5000`

## ✅ Security

- [ ] JWT_SECRET is at least 64 characters long
- [ ] Passwords are being hashed (check User model)
- [ ] CORS is configured with CLIENT_URL
- [ ] No sensitive data in console logs
- [ ] No hardcoded credentials in code
- [ ] `.env` files are in `.gitignore`

## ✅ Database

- [ ] MongoDB Atlas cluster is created
- [ ] Database user is created with password
- [ ] IP whitelist includes 0.0.0.0/0 (or your IP)
- [ ] Connection string is correct in backend `.env`
- [ ] Database name is set (e.g., "team-chat")
- [ ] Collections are created automatically on first use:
  - users
  - channels
  - messages

## ✅ Git & Version Control

- [ ] All files are committed
  - `git status` shows clean working directory
- [ ] No `nul` file in repository
- [ ] `.env` files are NOT committed (should be in `.gitignore`)
- [ ] `.env.example` files ARE committed
- [ ] Remote repository is set up (GitHub/GitLab/Bitbucket)
- [ ] Code is pushed to remote: `git push`

## ✅ Documentation

- [ ] `README.md` - Main documentation exists
- [ ] `DEPLOYMENT.md` - Deployment guide exists
- [ ] `PROJECT_SUMMARY.md` - Project summary exists
- [ ] `backend/.env.example` - Backend environment template exists
- [ ] `frontend/.env.example` - Frontend environment template exists
- [ ] `backend/vercel.json` - Backend Vercel config exists
- [ ] `frontend/vercel.json` - Frontend Vercel config exists

## ✅ Deployment Preparation

### MongoDB Atlas
- [ ] Cluster is running (not paused)
- [ ] Connection string is saved securely
- [ ] Database user credentials are saved securely

### Vercel Account
- [ ] Vercel account is created
- [ ] Vercel CLI is installed: `npm install -g vercel`
- [ ] Logged in to Vercel: `vercel login`

### Environment Variables for Production
Prepare these values (don't commit them):

**Backend:**
- [ ] `MONGODB_URI` - Your MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Generate new one for production:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] `CLIENT_URL` - Will be your frontend Vercel URL
- [ ] `NODE_ENV=production`

**Frontend:**
- [ ] `NEXT_PUBLIC_API_URL` - Will be your backend Vercel URL
- [ ] `NEXT_PUBLIC_SOCKET_URL` - Will be your backend Vercel URL

## ✅ Final Pre-Deployment Checks

- [ ] All features work correctly in local environment
- [ ] No console errors in browser
- [ ] No build errors or warnings
- [ ] All TypeScript types are correct
- [ ] Socket.io connects successfully
- [ ] Database operations work (create, read, update, delete)
- [ ] Authentication works (signup, login, logout, session persistence)
- [ ] Real-time features work (messages, typing, presence)
- [ ] Mobile responsive design works
- [ ] All images and assets load correctly

## 📋 Deployment Steps

Once all above items are checked, you're ready to deploy!

### Step 1: Deploy Backend
```bash
cd team-chat/backend
vercel --prod
```
- Copy the backend URL (e.g., https://team-chat-backend.vercel.app)
- Set environment variables in Vercel dashboard
- Redeploy if needed: `vercel --prod`

### Step 2: Deploy Frontend
```bash
cd team-chat/frontend
vercel --prod
```
- Copy the frontend URL (e.g., https://team-chat-frontend.vercel.app)
- Set environment variables in Vercel dashboard
- Update backend `CLIENT_URL` with this frontend URL
- Redeploy backend: `cd ../backend && vercel --prod`
- Redeploy frontend: `cd ../frontend && vercel --prod`

### Step 3: Test Production
- [ ] Open production frontend URL
- [ ] Sign up with a new account
- [ ] Create a channel
- [ ] Send messages
- [ ] Test in multiple browsers/devices
- [ ] Verify real-time features work
- [ ] Check browser console for errors
- [ ] Test on mobile device

## 🎉 Post-Deployment

- [ ] Share your deployed URL with users
- [ ] Monitor Vercel deployment logs
- [ ] Monitor MongoDB Atlas metrics
- [ ] Test with multiple concurrent users
- [ ] Gather feedback
- [ ] Fix any issues that arise

## 📞 Support

If you encounter any issues:

1. Check `DEPLOYMENT.md` for detailed troubleshooting
2. Review Vercel deployment logs
3. Check MongoDB Atlas connection status
4. Verify all environment variables are set correctly
5. Test locally first to isolate issues

---

## ✅ Quick Status Check

**Local Testing:** [ ] Complete
**Code Quality:** [ ] Complete
**Security:** [ ] Complete
**Database:** [ ] Complete
**Git:** [ ] Complete
**Documentation:** [ ] Complete
**Deployment Prep:** [ ] Complete

**READY TO DEPLOY:** [ ] YES / [ ] NO

---

Good luck with your deployment! 🚀

Your application is production-ready and all requirements have been met perfectly.
