#!/bin/bash

# CampusAgent Installation Script
# This script automates the setup process

echo "🏫 CampusAgent Setup Script"
echo "============================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

cd frontend
npm install
cd ..

cd backend
npm install
cd ..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Create backend .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "🔧 Creating backend/.env file..."
    cat > backend/.env << EOL
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
EOL
    echo "✅ Created backend/.env"
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env and add your Gemini API key!"
    echo "   Get one from: https://makersuite.google.com/app/apikey"
else
    echo "✅ backend/.env already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Add your GEMINI_API_KEY to backend/.env"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
echo "📖 For more help, see QUICKSTART.md or SETUP.md"
echo ""

