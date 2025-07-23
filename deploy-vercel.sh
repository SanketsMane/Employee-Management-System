#!/bin/bash

# 🚀 Vercel Deployment Script for EMS-Formonex
# This script prepares your project for Vercel deployment

set -e

echo "🚀 Starting Vercel deployment preparation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_status "Checking project structure..."

# Check required files
required_files=("vercel.json" "api/index.js" ".env.production")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file is missing"
        exit 1
    fi
done

# Install dependencies
print_status "Installing dependencies..."
if npm ci; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Run type check (if TypeScript)
if [ -f "tsconfig.json" ]; then
    print_status "Running type check..."
    npm run type-check || print_warning "Type check completed with warnings"
fi

# Run linting
print_status "Running linter..."
if npm run lint; then
    print_success "Linting passed"
else
    print_warning "Linting completed with warnings"
fi

# Test build locally
print_status "Testing production build..."
if npm run vercel-build; then
    print_success "Production build successful"
else
    print_error "Production build failed"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Install with: npm install -g vercel"
    print_status "You can deploy manually via the Vercel dashboard"
else
    print_success "Vercel CLI found"
    
    # Ask if user wants to deploy now
    echo ""
    read -p "Do you want to deploy to Vercel now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deploying to Vercel..."
        
        # Check if user is logged in
        if vercel whoami &> /dev/null; then
            print_status "Deploying to production..."
            vercel --prod
            print_success "Deployment completed!"
        else
            print_status "Please login to Vercel first:"
            vercel login
            print_status "After login, run: vercel --prod"
        fi
    else
        print_status "Skipping deployment. Run 'vercel --prod' when ready."
    fi
fi

echo ""
print_success "🎉 Vercel deployment preparation completed!"
echo ""
print_status "📋 Next steps:"
echo "   1. Push your code to GitHub/GitLab"
echo "   2. Import your repository in Vercel dashboard"
echo "   3. Configure environment variables in Vercel"
echo "   4. Deploy and test your application"
echo ""
print_status "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"
echo ""
print_status "🌐 After deployment, your app will be available at:"
echo "   https://your-app-name.vercel.app"
echo ""

# Clean up dist folder (optional)
read -p "Clean up build files? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf dist
    print_success "Build files cleaned up"
fi

print_success "Ready for Vercel deployment! 🚀"
