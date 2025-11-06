#!/usr/bin/env bash
# Pre-deployment verification script

echo "🔍 Checking Next.js Frontend Setup..."
echo ""

# Check Node version
echo "✓ Checking Node.js version..."
node --version

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi
echo "✓ package.json found"

# Check if next.config.ts exists
if [ ! -f "next.config.ts" ]; then
    echo "❌ next.config.ts not found!"
    exit 1
fi
echo "✓ next.config.ts found"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found!"
    exit 1
fi
echo "✓ .env.production found"

# Check environment variables
if grep -q "NEXT_PUBLIC_API_URL" .env.production; then
    echo "✓ NEXT_PUBLIC_API_URL configured"
else
    echo "⚠️  NEXT_PUBLIC_API_URL not found in .env.production"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Run build test
echo ""
echo "🔨 Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful! Ready for deployment."
    echo ""
    echo "Next steps:"
    echo "1. Commit changes: git add . && git commit -m 'Ready for deployment'"
    echo "2. Push to GitHub: git push origin main"
    echo "3. Deploy on Render using render.yaml"
    exit 0
else
    echo ""
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi
