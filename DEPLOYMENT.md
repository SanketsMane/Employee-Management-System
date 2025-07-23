# 🚀 EMS-Formonex Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account with database URL
- Domain name (for production)
- SSL certificate (recommended)

## 📦 Building for Production

### Option 1: Automated Build Script

```bash
# Make the build script executable
chmod +x build.sh

# Run the build process
./build.sh
```

This will:
- Install dependencies
- Build the frontend
- Validate backend code
- Create deployment-ready files in `./deployment` folder

### Option 2: Manual Build

```bash
# Install dependencies
npm ci --omit=dev
cd backend && npm ci --omit=dev && cd ..

# Build frontend
npm run build

# The built files will be in the 'dist' folder
```

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Steps

1. **Update environment variables** in `docker-compose.yml`:
   ```yaml
   environment:
     - MONGODB_URI=your-mongodb-connection-string
     - JWT_SECRET=your-secure-jwt-secret
     - FRONTEND_URL=https://your-domain.com
   ```

2. **Build and run**:
   ```bash
   docker-compose up -d
   ```

3. **Check status**:
   ```bash
   docker-compose ps
   docker-compose logs
   ```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:3002/api

## 🖥️ Traditional Server Deployment

### 1. Server Setup

Update your server with the deployment files:

```bash
# Upload the deployment folder to your server
scp -r deployment/ user@your-server:/path/to/app/

# SSH into your server
ssh user@your-server

# Navigate to app directory
cd /path/to/app/deployment
```

### 2. Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### 3. Start the Application

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs ems-formonex

# Save PM2 configuration
pm2 save
pm2 startup
```

### 4. Nginx Configuration (Reverse Proxy)

Create nginx configuration file `/etc/nginx/sites-available/ems-formonex`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve static files (React build)
    location / {
        root /path/to/app/deployment/public;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/ems-formonex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 SSL Certificate (Production)

### Using Certbot (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (add to crontab)
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🌍 Environment Variables

### Backend (.env.production)

```bash
NODE_ENV=production
PORT=3002
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secure-jwt-secret-change-this
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-domain.com
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Frontend (.env.production)

```bash
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=EMS-Formonex
VITE_APP_VERSION=1.0.0
```

## 📊 Monitoring and Maintenance

### PM2 Commands

```bash
# View processes
pm2 list

# Restart application
pm2 restart ems-formonex

# Stop application
pm2 stop ems-formonex

# View logs
pm2 logs ems-formonex

# Monitor resource usage
pm2 monit
```

### Health Checks

- Frontend health: `https://your-domain.com/health`
- Backend health: `https://your-domain.com/api/health`

### Log Files

- Application logs: `./logs/`
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   sudo lsof -i :3002
   sudo kill -9 <PID>
   ```

2. **MongoDB connection issues**:
   - Check MongoDB Atlas IP whitelist
   - Verify connection string
   - Check network connectivity

3. **Static files not loading**:
   - Verify nginx configuration
   - Check file permissions
   - Clear browser cache

4. **API requests failing**:
   - Check CORS configuration
   - Verify proxy settings in nginx
   - Check backend logs

### Performance Optimization

1. **Enable Gzip compression** in nginx
2. **Set up CDN** for static assets
3. **Configure caching headers**
4. **Monitor memory usage** with PM2
5. **Set up database indexing**

## 🔄 Updates and Deployment

### Zero-Downtime Deployment

```bash
# Build new version
./build.sh

# Deploy with PM2
pm2 reload ems-formonex

# Or with Docker
docker-compose pull
docker-compose up -d
```

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer** (nginx upstream)
2. **Multiple server instances**
3. **Database read replicas**
4. **Redis for session storage**
5. **CDN for static assets**

### Monitoring Tools

- **PM2 Plus**: Process monitoring
- **New Relic**: Application performance
- **MongoDB Atlas Monitoring**: Database metrics
- **Nginx Amplify**: Web server monitoring

## 🛡️ Security Checklist

- [ ] HTTPS enabled with valid certificate
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] JWT secret is secure and unique
- [ ] File upload limits configured
- [ ] Rate limiting enabled
- [ ] Security headers configured in nginx
- [ ] Regular security updates applied

## 📞 Support

For deployment issues:
1. Check logs first
2. Verify environment variables
3. Test database connectivity
4. Check firewall settings
5. Review nginx configuration

---

**🎉 Your EMS-Formonex application is now ready for production deployment!**
