#!/bin/bash

echo "🚀 EMS-Formonex Deployment Script"
echo "================================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the project
echo "🔨 Building project..."
npm run vercel-build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Built files in dist/ directory:"
    ls -la dist/
    
    echo ""
    echo "🌐 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Run: vercel login (authenticate with GitHub)"
    echo "2. Run: vercel --prod (deploy to production)"
    echo ""
    echo "Or use Vercel web dashboard:"
    echo "1. Go to https://vercel.com"
    echo "2. Import GitHub repo: https://github.com/SanketsMane/Employee-Management-System"
    echo "3. Set environment variables:"
    echo "   MONGODB_URI=mongodb+srv://contactsanket1:7Zkn5fLWWMCWTAhP@cluster0.if3q29s.mongodb.net/ems-formonex"
    echo "   NODE_ENV=production"
    echo "4. Deploy! ✨"
else
    echo "❌ Build failed. Please check the errors above."
fi
