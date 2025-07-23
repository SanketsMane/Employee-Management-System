#!/bin/bash
echo "🔨 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🏗️ Building Vite project..."
npm run build

# Verify build output
echo "✅ Verifying build output..."
if [ -d "dist" ]; then
    echo "✅ dist directory exists"
    ls -la dist/
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html found"
    else
        echo "❌ index.html not found"
        exit 1
    fi
else
    echo "❌ dist directory not found"
    exit 1
fi

echo "🎉 Build completed successfully!"
