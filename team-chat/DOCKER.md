# Docker Deployment Guide

This guide explains how to deploy the Team Chat application using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Architecture

The application consists of three services:

1. **MongoDB** - Database service
2. **Backend** - Node.js/Express API with Socket.IO
3. **Frontend** - Next.js application with SSR (Server-Side Rendering)

## Quick Start

### Production Deployment

1. **Clone the repository and navigate to the project root:**
   ```bash
   cd team-chat
   ```

2. **Create a `.env` file from the example:**
   ```bash
   cp .env.example .env
   ```

3. **Update the `.env` file with your configurations:**
   ```env
   # MongoDB Configuration
   MONGO_ROOT_USERNAME=admin
   MONGO_ROOT_PASSWORD=your-secure-password
   MONGO_DATABASE=team-chat
   MONGO_PORT=27017

   # Backend Configuration
   BACKEND_PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this

   # Frontend Configuration
   FRONTEND_PORT=3000
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   CLIENT_URL=http://localhost:3000
   ```

4. **Build and start all services:**
   ```bash
   docker-compose up -d --build
   ```

5. **Check the status of services:**
   ```bash
   docker-compose ps
   ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Development Deployment

For development with hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## Docker Commands

### Starting Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend
docker-compose up -d frontend
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

### Viewing Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Rebuilding Services

```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

### Executing Commands in Containers

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password
```

## Environment Variables

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Auto-configured |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | `http://localhost:5000` |

## Volumes

The application uses the following volumes:

- `mongodb_data` - Persists MongoDB database files
- `mongodb_config` - Persists MongoDB configuration
- `./backend/uploads` - Stores uploaded files (images, documents, etc.)

## Networking

All services communicate through the `team-chat-network` bridge network.

## Health Checks

Both backend and MongoDB services have health checks configured:

- **MongoDB**: Checks database connectivity every 10 seconds
- **Backend**: Checks HTTP endpoint `/health` every 30 seconds

## Production Considerations

### Security

1. **Change default credentials:**
   - Update `MONGO_ROOT_PASSWORD` with a strong password
   - Update `JWT_SECRET` with a random secure string

2. **Use HTTPS in production:**
   - Set up a reverse proxy (Nginx/Traefik)
   - Configure SSL certificates

3. **Limit exposed ports:**
   - Don't expose MongoDB port in production
   - Use internal Docker networking

### Performance

1. **Enable caching:**
   - Configure Redis for session management
   - Enable Next.js caching strategies

2. **Scale services:**
   ```bash
   docker-compose up -d --scale backend=3
   ```

3. **Resource limits:**
   Add resource limits to docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
   ```

## Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check service status
docker-compose ps
```

### MongoDB connection issues

```bash
# Verify MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Test MongoDB connection
docker-compose exec mongodb mongosh -u admin -p password
```

### Port conflicts

If ports are already in use, update the `.env` file:
```env
FRONTEND_PORT=3001
BACKEND_PORT=5001
MONGO_PORT=27018
```

### Clear all data and restart

```bash
# Stop and remove everything
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

## Backup and Restore

### Backup MongoDB

```bash
# Create backup
docker-compose exec mongodb mongodump -u admin -p password --authenticationDatabase admin --db team-chat --out /tmp/backup

# Copy backup to host
docker cp team-chat-mongodb:/tmp/backup ./backup
```

### Restore MongoDB

```bash
# Copy backup to container
docker cp ./backup team-chat-mongodb:/tmp/backup

# Restore backup
docker-compose exec mongodb mongorestore -u admin -p password --authenticationDatabase admin --db team-chat /tmp/backup/team-chat
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [MongoDB Docker Documentation](https://hub.docker.com/_/mongo)

## Support

For issues and questions:
- Check the logs: `docker-compose logs -f`
- Verify environment variables in `.env`
- Ensure all ports are available
- Check Docker and Docker Compose versions
