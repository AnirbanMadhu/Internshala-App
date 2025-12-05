# Deploy Team Chat App with Docker

This guide shows you how to deploy the entire Team Chat Application stack using Docker and Docker Compose.

## What's Included

The Docker setup includes:
- **Backend** - Node.js/Express API with Socket.io
- **Frontend** - Next.js application
- **MongoDB Atlas** - Cloud-hosted MongoDB (no local container needed)

Both services run in isolated containers and communicate over a Docker network, connecting to your existing MongoDB Atlas database.

## Prerequisites

1. **Install Docker Desktop**
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Mac: https://docs.docker.com/desktop/install/mac-install/
   - Linux: https://docs.docker.com/desktop/install/linux-install/

2. **Verify Installation**
   ```bash
   docker --version
   docker compose version
   ```

## Quick Start (Development)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd team-chat
```

### 2. Use Your Existing .env File

Your `.env` file already contains:
```env
MONGODB_URI=mongodb+srv://...
BACKEND_PORT=5000
FRONTEND_PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

**No changes needed!** The Docker setup will use your existing MongoDB Atlas connection.

### 3. Build and Start Services
```bash
# Build and start all services
docker compose up --build

# Or run in detached mode (background)
docker compose up -d --build
```

This will:
- Build the backend Docker image
- Build the frontend Docker image
- Start both services
- Create a network for inter-service communication
- Connect to your MongoDB Atlas database

### 4. Access the Application

Once all services are running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Backend Health Check**: http://localhost:5000/health

### 5. View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### 6. Stop Services
```bash
# Stop but keep containers
docker compose stop

# Stop and remove containers (data persists in volumes)
docker compose down

# Stop, remove containers AND delete all data
docker compose down -v
```

## Production Deployment

### 1. Update Environment Variables

Your `.env` file already uses MongoDB Atlas. For production, ensure strong values:

```env
# MongoDB Atlas (already configured)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?appName=Cluster0

# Backend configuration
BACKEND_PORT=5000
JWT_SECRET=<generate-strong-random-secret-here>
CLIENT_URL=https://yourdomain.com

# Frontend configuration
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
```

**Generate Strong JWT Secret:**
```bash
# Generate JWT secret (Linux/Mac)
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 2. Deploy with Docker Compose

Simply run the same command:
```bash
docker compose up -d --build
```

The services will use production values from your `.env` file.

## Docker Commands Reference

### Building
```bash
# Build all images
docker compose build

# Build specific service
docker compose build backend

# Build without cache (clean build)
docker compose build --no-cache
```

### Running
```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Start specific service
docker compose up backend
```

### Stopping
```bash
# Stop all services
docker compose stop

# Stop specific service
docker compose stop frontend

# Remove containers
docker compose down

# Remove containers and volumes (deletes data!)
docker compose down -v
```

### Monitoring
```bash
# View logs
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View logs for specific service
docker compose logs backend

# View container status
docker compose ps

# View resource usage
docker stats
```

### Debugging
```bash
# Execute command in running container
docker compose exec backend sh
docker compose exec frontend sh

# View backend logs
docker compose exec backend cat /app/dist/server.js

# Check MongoDB connection
docker compose exec mongodb mongosh -u admin -p password123
```

### Cleanup
```bash
# Remove stopped containers
docker compose rm

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Complete cleanup (use with caution!)
docker system prune -a --volumes
```

## Accessing MongoDB Atlas

### Using MongoDB Compass
1. Download: https://www.mongodb.com/try/download/compass
2. Use your MongoDB Atlas connection string from `.env`
3. Browse your data, collections, and documents

### Using MongoDB Atlas Web Interface
1. Go to https://cloud.mongodb.com
2. Login to your account
3. Navigate to your cluster
4. Click "Browse Collections" to view data

## Troubleshooting

### Port Already in Use
```bash
# Find what's using port 3000
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Kill the process or change ports in .env
```

### Build Fails
```bash
# Clean build
docker compose build --no-cache

# Remove old images
docker image prune -a
```

### Container Won't Start
```bash
# Check logs
docker compose logs backend

# Check container status
docker compose ps

# Restart specific service
docker compose restart backend
```

### MongoDB Atlas Connection Failed
```bash
# Check backend logs for connection errors
docker compose logs backend

# Verify MONGODB_URI in .env is correct
# Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
# Check your MongoDB Atlas username and password
```

### Frontend Can't Connect to Backend
```bash
# Ensure backend is healthy
curl http://localhost:5000/health

# Check if services are on same network
docker network inspect team-chat_team-chat-network

# Verify environment variables
docker compose config
```

### Data Persistence

All your data is stored in MongoDB Atlas cloud database:
- Data persists even if you stop/remove Docker containers
- Automatic backups available in MongoDB Atlas
- No local volumes to manage

## File Structure

```
team-chat/
├── docker-compose.yml           # Docker orchestration
├── .env                          # Environment variables
├── .env.docker.example          # Example environment file
├── backend/
│   ├── Dockerfile               # Backend image definition
│   ├── .dockerignore            # Files to exclude from build
│   └── ...
├── frontend/
│   ├── Dockerfile               # Frontend image definition
│   ├── .dockerignore            # Files to exclude from build
│   └── ...
└── DOCKER_DEPLOYMENT.md         # This file
```

## Environment Variables

### Docker Compose (.env)
- `MONGODB_URI` - MongoDB Atlas connection string
- `BACKEND_PORT` - Backend external port (default: 5000)
- `FRONTEND_PORT` - Frontend external port (default: 3000)
- `JWT_SECRET` - Secret key for JWT tokens
- `CLIENT_URL` - Frontend URL for CORS
- `NEXT_PUBLIC_API_URL` - Backend API URL for frontend
- `NEXT_PUBLIC_SOCKET_URL` - Backend WebSocket URL for frontend

### Backend Service
- `NODE_ENV` - Environment (production/development)
- `PORT` - Internal port (always 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `CLIENT_URL` - Frontend URL for CORS

### Frontend Service
- `NODE_ENV` - Environment (production/development)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SOCKET_URL` - Backend WebSocket URL

## Volumes

Docker creates a volume for file uploads:
- `./backend/uploads` - User-uploaded files (mounted from host)

Data persists on your host machine, even after `docker compose down`.

## Networks

All services communicate over `team-chat-network` bridge network:
- Services can reach each other using container names
- Backend connects to MongoDB Atlas over the internet
- Frontend connects to backend at `backend:5000` (internal) or via host ports

## Security Best Practices

1. **Protect sensitive credentials**
   - Use strong MongoDB Atlas password
   - Generate strong `JWT_SECRET`
   - Never commit `.env` to version control

2. **Use secrets management**
   - Use Docker secrets for sensitive data in production
   - Rotate credentials regularly

3. **Run as non-root**
   - Images already configured to run as non-root users
   - Backend runs as `expressjs` user (UID 1001)
   - Frontend runs as `nextjs` user (UID 1001)

4. **Limit exposed ports**
   - Only expose necessary ports
   - Use reverse proxy (nginx) in production

5. **Regular updates**
   - Keep base images updated
   - Update dependencies regularly

## Performance Optimization

### Build Optimization
```bash
# Use build cache
docker compose build

# Multi-stage builds (already implemented)
# - Reduces final image size
# - Separates build and runtime dependencies
```

### Resource Limits
Add to `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Deploying to Cloud

### AWS EC2 / DigitalOcean / Azure VM
1. Install Docker on the VM
2. Clone repository
3. Create `.env` with production values
4. Run `docker compose up -d`
5. Configure nginx as reverse proxy
6. Setup SSL with Let's Encrypt

### Docker Swarm / Kubernetes
For production-scale deployments, consider:
- Docker Swarm for orchestration
- Kubernetes for advanced scaling
- Managed services (ECS, AKS, GKE)

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**Questions or issues?** Check logs with `docker compose logs -f` and refer to the troubleshooting section above.
