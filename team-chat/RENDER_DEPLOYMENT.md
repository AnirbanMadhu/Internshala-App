# Deploy Team Chat App to Render

This guide walks you through deploying the Team Chat Application to Render (free tier available).

## Prerequisites

- GitHub account with your code pushed to a repository
- Render account (sign up at https://render.com)
- MongoDB Atlas account (free tier at https://www.mongodb.com/cloud/atlas)

## Step 1: Setup MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create a Cluster**
   - Click "Create" → "Deploy a database"
   - Select **M0 FREE** tier
   - Choose your preferred cloud provider and region
   - Click "Create Deployment"

3. **Create Database User**
   - You'll be prompted to create a user
   - Set username and password (save these!)
   - Click "Create Database User"

4. **Configure Network Access**
   - Click "Add a connection IP address"
   - Select "Allow access from anywhere" (0.0.0.0/0)
   - Click "Add Entry"

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password
   - Save this for later

## Step 2: Deploy Backend to Render

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Click "Connect"

3. **Configure Backend Service**

   **IMPORTANT:** Use these exact settings:

   - **Name**: `team-chat-backend` (or your preferred name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `team-chat/backend` ⚠️ **Just type: team-chat/backend**
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

   > **Note:** Since your repository has files inside a `team-chat/` subdirectory, the Root Directory must include it!

   **Screenshot reference for Root Directory field:**
   ```
   Root Directory: [team-chat/backend]  ← Type exactly this
   ```
   ❌ Wrong: `backend`, `/backend`, `/opt/render/project/src/backend`
   ✅ Correct: `team-chat/backend`

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add:

   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your-mongodb-atlas-connection-string-here
   JWT_SECRET=your-super-secret-random-string-here
   CLIENT_URL=https://team-chat-frontend.onrender.com
   ```

   **Important Notes:**
   - Replace `MONGODB_URI` with your MongoDB Atlas connection string from Step 1
   - Replace `JWT_SECRET` with a strong random string (generate one with `openssl rand -base64 32`)
   - Replace `CLIENT_URL` with your actual frontend URL (we'll update this after deploying frontend)
   - Render uses port 10000 by default for web services

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait for the build to complete (5-10 minutes)
   - Once deployed, you'll get a URL like: `https://team-chat-backend.onrender.com`

6. **Test Backend**
   - Visit: `https://team-chat-backend.onrender.com/health`
   - You should see: `{"status":"OK","message":"Server is running"}`

## Step 3: Deploy Frontend to Render

1. **Create New Web Service**
   - Go back to Render Dashboard
   - Click "New +" → "Web Service"
   - Select the same repository

2. **Configure Frontend Service**

   **IMPORTANT:** Use these exact settings:

   - **Name**: `team-chat-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `team-chat/frontend` ⚠️ **Just type: team-chat/frontend**
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

   > **Note:** Since your repository has files inside a `team-chat/` subdirectory, the Root Directory must include it!

   **Screenshot reference for Root Directory field:**
   ```
   Root Directory: [team-chat/frontend]  ← Type exactly this
   ```
   ❌ Wrong: `frontend`, `/frontend`, `/opt/render/project/src/frontend`
   ✅ Correct: `team-chat/frontend`

3. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":

   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://team-chat-backend.onrender.com
   NEXT_PUBLIC_SOCKET_URL=https://team-chat-backend.onrender.com
   ```

   **Important:** Replace the URLs with your actual backend URL from Step 2

4. **Create Web Service**
   - Click "Create Web Service"
   - Wait for the build (5-10 minutes)
   - You'll get a URL like: `https://team-chat-frontend.onrender.com`

## Step 4: Update Backend Environment Variables

1. **Go to Backend Service**
   - In Render Dashboard, click on your backend service
   - Go to "Environment" tab

2. **Update CLIENT_URL**
   - Find the `CLIENT_URL` variable
   - Update it to your frontend URL: `https://team-chat-frontend.onrender.com`
   - Click "Save Changes"
   - The service will automatically redeploy

## Step 5: Test Your Application

1. Visit your frontend URL: `https://team-chat-frontend.onrender.com`
2. Try to sign up for a new account
3. Login and create a channel
4. Send messages and test real-time features

## Important Notes

### Free Tier Limitations

- **Sleep after inactivity**: Free tier services sleep after 15 minutes of inactivity
- **Cold starts**: First request after sleep takes 30-60 seconds to wake up
- **750 hours/month**: Each service gets 750 free hours per month
- **No autoscaling**: Limited to single instance

### Custom Domain (Optional)

1. Go to service settings
2. Click "Custom Domain"
3. Add your domain and follow DNS instructions

### SSL/HTTPS

- Render automatically provides SSL certificates
- All services run on HTTPS by default

## Troubleshooting

### "Service Root Directory is missing" Error
**Error:** `Service Root Directory "/opt/render/project/src/backend" is missing`

**Solution:**
This happens because your Git repository has files inside a `team-chat/` subdirectory.

- The Root Directory field should be `team-chat/backend` (not just `backend`)
- Go to your service Settings → "Build & Deploy"
- Change Root Directory to: `team-chat/backend`
- Save changes and Render will automatically redeploy

**Why?** Your GitHub repo structure is:
```
Internshala-App/ (repo root)
└── team-chat/
    ├── backend/
    └── frontend/
```
So Render needs the full path: `team-chat/backend`

### Build fails with TypeScript errors
**Error:** `error TS7016: Could not find a declaration file for module 'express'`

**Solution:**
This was fixed by moving TypeScript and @types packages to `dependencies` in package.json.
If you still see this error, make sure you've pulled the latest code from GitHub.

### Backend won't start
- Check logs in Render Dashboard → Backend Service → Logs
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` matches backend URL
- Check CORS settings in backend allow your frontend domain
- Look at browser console for errors

### WebSocket/Socket.io not working
- Ensure `NEXT_PUBLIC_SOCKET_URL` is set correctly
- Check that backend service is running
- WebSockets work over HTTPS on Render

### Database connection errors
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check database user credentials
- Ensure connection string format is correct

## Updating Your Application

When you push changes to GitHub:
1. Render automatically detects changes
2. Rebuilds and redeploys your services
3. No manual intervention needed

To disable auto-deploy:
- Go to service Settings → Build & Deploy
- Toggle "Auto-Deploy"

## Monitoring

- **Logs**: View real-time logs in service dashboard
- **Metrics**: Basic CPU and memory usage available
- **Health checks**: Render automatically monitors your services

## Cost Optimization

Free tier should be sufficient for development/testing. For production:
- Upgrade to paid plans for:
  - No sleep/cold starts
  - More compute resources
  - Better performance
  - 24/7 availability

## Summary

Your application URLs:
- **Frontend**: `https://team-chat-frontend.onrender.com`
- **Backend**: `https://team-chat-backend.onrender.com`
- **Backend Health**: `https://team-chat-backend.onrender.com/health`

Both services will automatically redeploy when you push to GitHub!

---

**Questions or issues?** Check the [Render documentation](https://render.com/docs) or backend logs for debugging.
