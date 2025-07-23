#!/bin/bash

echo "🚀 Building EMS-Formonex for Production Deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is not supported. Please use version 18.0.0 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"

# Create deployment directory
DEPLOY_DIR="./deployment"
mkdir -p $DEPLOY_DIR

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm ci --omit=dev

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm ci --omit=dev
cd ..

echo -e "${BLUE}🔧 Building frontend...${NC}"

# Build frontend for production
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend build completed!${NC}"

# Copy backend files to deployment directory
echo -e "${BLUE}📋 Preparing backend files...${NC}"
cp -r backend/* $DEPLOY_DIR/
cp -r dist $DEPLOY_DIR/public

echo -e "${BLUE}🧪 Running tests...${NC}"

# Validate backend syntax
cd backend
npm run validate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend validation failed!${NC}"
    exit 1
fi
cd ..

echo -e "${GREEN}✅ All validations passed!${NC}"

# Create production files
echo -e "${BLUE}📄 Creating production configuration...${NC}"

# Copy environment files
cp .env.production $DEPLOY_DIR/.env
cp backend/.env.production $DEPLOY_DIR/.env.backend

# Create start script
cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting EMS-Formonex Production Server..."
export NODE_ENV=production
node server.js
EOF

chmod +x $DEPLOY_DIR/start.sh

# Create PM2 ecosystem file
cat > $DEPLOY_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ems-formonex',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create logs directory
mkdir -p $DEPLOY_DIR/logs

echo -e "${GREEN}🎉 Build completed successfully!${NC}"
echo -e "${BLUE}📁 Deployment files are in: $DEPLOY_DIR${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Upload the deployment folder to your server"
echo "2. Install PM2: npm install -g pm2"
echo "3. Start the application: pm2 start ecosystem.config.js"
echo "4. Set up reverse proxy (Nginx) to serve static files"
echo ""
echo -e "${GREEN}🔗 Production URLs:${NC}"
echo "   Backend API: http://your-domain.com:3002/api"
echo "   Frontend: http://your-domain.com"
echo ""
echo -e "${BLUE}💡 For Docker deployment, run: docker-compose up -d${NC}"
