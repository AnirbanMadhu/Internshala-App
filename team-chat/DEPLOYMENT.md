# Deployment Guide

This guide provides step-by-step instructions for deploying the Team Chat Application to production.

## Prerequisites

Before deploying, ensure you have:

1. A MongoDB Atlas account (free tier is sufficient)
2. A Vercel account (free tier is sufficient)
3. Git installed on your system
4. Node.js 18+ installed
5. Vercel CLI installed: `npm install -g vercel`

## Step 1: Setup MongoDB Atlas

1. **Create a MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create a New Cluster**
   - Click "Build a Cluster"
   - Select the FREE tier (M0 Sandbox)
   - Choose your preferred cloud provider and region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these securely!)
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Addresses**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go back to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<username>` and `<password>` with your database user credentials
   - Save this connection string for later

## Step 2: Deploy Backend to Vercel

1. **Navigate to Backend Directory**
   ```bash
   cd team-chat/backend
   ```

2. **Ensure Dependencies are Installed**
   ```bash
   npm install
   ```

3. **Test Locally First**
   ```bash
   npm run dev
   ```
   - Verify it connects to MongoDB
   - Check http://localhost:5000/health

4. **Deploy to Vercel**
   ```bash
   vercel
   ```

   Follow the prompts:
   - Set up and deploy? Yes
   - Which scope? (select your account)
   - Link to existing project? No
   - What's your project's name? team-chat-backend (or your preferred name)
   - In which directory is your code located? ./
   - Want to override settings? No

5. **Set Environment Variables**

   After deployment, go to your Vercel Dashboard:
   - Navigate to your backend project
   - Go to "Settings" → "Environment Variables"
   - Add the following variables:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string | Production |
   | `JWT_SECRET` | Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` | Production |
   | `CLIENT_URL` | (Will add after frontend deployment) | Production |
   | `NODE_ENV` | `production` | Production |

6. **Redeploy Backend**
   ```bash
   vercel --prod
   ```

7. **Save Your Backend URL**
   - Copy the production URL (e.g., https://team-chat-backend.vercel.app)
   - You'll need this for frontend deployment

## Step 3: Deploy Frontend to Vercel

1. **Navigate to Frontend Directory**
   ```bash
   cd ../frontend
   ```

2. **Update Environment Variables**
   - Edit `.env` file
   - Update `NEXT_PUBLIC_API_URL` with your backend URL
   - Update `NEXT_PUBLIC_SOCKET_URL` with your backend URL

3. **Test Locally**
   ```bash
   npm run dev
   ```
   - Verify it connects to the deployed backend
   - Test login/signup functionality

4. **Deploy to Vercel**
   ```bash
   vercel
   ```

   Follow the prompts:
   - Set up and deploy? Yes
   - Which scope? (select your account)
   - Link to existing project? No
   - What's your project's name? team-chat-frontend (or your preferred name)
   - In which directory is your code located? ./
   - Want to override settings? No

5. **Set Environment Variables**

   Go to your Vercel Dashboard:
   - Navigate to your frontend project
   - Go to "Settings" → "Environment Variables"
   - Add the following variables:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `NEXT_PUBLIC_API_URL` | Your backend URL (e.g., https://team-chat-backend.vercel.app) | Production |
   | `NEXT_PUBLIC_SOCKET_URL` | Your backend URL (same as above) | Production |

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

7. **Save Your Frontend URL**
   - Copy the production URL (e.g., https://team-chat-frontend.vercel.app)

## Step 4: Update Backend with Frontend URL

1. **Go Back to Backend Vercel Dashboard**
   - Navigate to your backend project
   - Go to "Settings" → "Environment Variables"
   - Update or add `CLIENT_URL` with your frontend URL

2. **Redeploy Backend**
   ```bash
   cd ../backend
   vercel --prod
   ```

## Step 5: Verify Deployment

1. **Test the Application**
   - Open your frontend URL in a browser
   - Create a new account (signup)
   - Try logging in
   - Create a channel
   - Send some messages
   - Open the app in a second browser/tab to test real-time features

2. **Check for Errors**
   - Open browser developer console (F12)
   - Check for any JavaScript errors
   - Verify WebSocket connection is established

3. **Test Mobile Responsiveness**
   - Open the app on a mobile device
   - Test all features work correctly

## Troubleshooting

### Backend Issues

**Error: Cannot connect to MongoDB**
- Verify MongoDB Atlas connection string is correct
- Check that IP whitelist includes 0.0.0.0/0
- Ensure database user credentials are correct
- Check MongoDB Atlas cluster is running

**Error: JWT errors or authentication fails**
- Verify `JWT_SECRET` is set in Vercel environment variables
- Ensure `JWT_SECRET` is the same across all deployments
- Check that `CLIENT_URL` matches your frontend URL exactly

**Error: CORS issues**
- Verify `CLIENT_URL` environment variable matches your frontend URL
- Check that there are no trailing slashes in URLs
- Ensure CORS is enabled in backend configuration

### Frontend Issues

**Error: Cannot reach backend**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is deployed and running
- Test backend health endpoint: `https://your-backend-url/health`

**Error: WebSocket connection failed**
- Verify `NEXT_PUBLIC_SOCKET_URL` matches backend URL
- Check browser console for specific Socket.io errors
- Ensure backend Socket.io server is running

**Error: Environment variables not working**
- In Next.js, environment variables MUST start with `NEXT_PUBLIC_` to be available in browser
- After changing environment variables, redeploy: `vercel --prod`
- Clear browser cache and hard reload (Ctrl+Shift+R)

### General Issues

**Error: 404 Not Found on Vercel**
- Check `vercel.json` configuration exists in both frontend and backend
- Verify build completed successfully in Vercel dashboard
- Check deployment logs for errors

**Error: Application works locally but not in production**
- Check all environment variables are set in Vercel
- Verify URLs don't have trailing slashes
- Check browser console for HTTPS/HTTP mixed content warnings
- Ensure MongoDB Atlas allows connections from anywhere

## Monitoring and Maintenance

### Monitor Application Health

1. **Vercel Analytics**
   - Enable Vercel Analytics in your project settings
   - Monitor page load times and errors

2. **MongoDB Atlas Monitoring**
   - Check database metrics in MongoDB Atlas
   - Monitor connection counts and query performance

3. **Error Logging**
   - Check Vercel deployment logs regularly
   - Set up alerts for critical errors

### Regular Maintenance

1. **Update Dependencies**
   ```bash
   npm outdated
   npm update
   ```

2. **Security Updates**
   - Run `npm audit` regularly
   - Fix vulnerabilities: `npm audit fix`

3. **Database Backups**
   - MongoDB Atlas provides automatic backups
   - Consider setting up additional backup strategies for critical data

4. **Rotate JWT Secret**
   - Periodically generate new JWT secret
   - Update in Vercel environment variables
   - Note: This will log out all users

## Scaling Considerations

As your application grows:

1. **Database Scaling**
   - Upgrade MongoDB Atlas tier for better performance
   - Add indexes for frequently queried fields
   - Consider database replication

2. **Backend Scaling**
   - Vercel automatically scales serverless functions
   - For WebSocket connections, consider dedicated server hosting
   - Options: Railway, Render, or AWS EC2

3. **Frontend Scaling**
   - Vercel automatically handles CDN distribution
   - Enable image optimization in Next.js
   - Implement code splitting and lazy loading

4. **Caching**
   - Implement Redis for caching frequent queries
   - Use Vercel Edge Caching for static assets
   - Cache user sessions and channel data

## Cost Estimation

**Free Tier (Suitable for Development/Testing)**
- MongoDB Atlas: Free (M0 Cluster - 512MB storage)
- Vercel: Free (100GB bandwidth, unlimited deployments)
- Total: $0/month

**Production Tier (For Real Applications)**
- MongoDB Atlas: $0-9/month (M2/M5 Cluster)
- Vercel Pro: $20/month (Better performance, analytics)
- Total: $20-30/month

## Support and Resources

- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com
- Next.js Documentation: https://nextjs.org/docs
- Socket.io Documentation: https://socket.io/docs

## Conclusion

Your Team Chat Application is now deployed and ready for use!

Remember to:
- Keep your environment variables secure
- Regularly update dependencies
- Monitor application performance
- Back up your database
- Test thoroughly after any updates

For issues or questions, check the main README.md or open an issue on GitHub.

Happy chatting! 🎉
